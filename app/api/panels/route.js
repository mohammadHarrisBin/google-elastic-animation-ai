import { Client } from "@elastic/elasticsearch";

import { NextResponse } from "next/server";

// POST /api/save save panelmetadata
export async function POST(req) {
  const client = new Client({
    node: process.env.ELASTIC_URL,
    auth: {
      apiKey: process.env.ELASTIC_API_KEY,
    },
    serverMode: "serverless",
  });

  await client.ping();
  console.log("Connected to Elasticsearch");

  const { panelMetaDataList } = await req.json();

// Generate ELSER tokens for each bubble
  async function generateElserTokens(text) {
    try {
      const response = await client.inference.inference({
        inference_id: ".elser-2-elastic",
        input: text,
      });

      // ELSER returns tokens directly in different formats
      // Check these common paths:
      if (response.inference_results && response.inference_results[0]) {
        let result = response.inference_results[0].predicted_value;
        // If it's an array, get the first element
        if (Array.isArray(result)) result = result[0];
        // If it has an embedding property, extract that
        if (result && result.embedding) return result.embedding;
        return result;
      }
      if (response.sparse_embedding) {
        let result = response.sparse_embedding;
        if (Array.isArray(result)) result = result[0];
        if (result && result.embedding) return result.embedding;
        return result;
      }
      if (response.text_expansion) {
        let result = response.text_expansion;
        if (Array.isArray(result)) result = result[0];
        if (result && result.embedding) return result.embedding;
        return result;
      }

      // If none match, check if response itself is an array
      if (Array.isArray(response) && response.length > 0) {
        const result = response[0];
        if (result && result.embedding) return result.embedding;
        return result;
      }

      // If none match, return the whole response and we'll debug
      console.error("Unexpected ELSER response structure:", response);
      return response;
    } catch (error) {
      console.error("ELSER error:", error.message);
      throw error;
    }
  }

  // Process panels to add ELSER tokens
  const panelsWithTokens = await Promise.all(
    panelMetaDataList.map(async (panel) => {
      const bubblesWithTokens = await Promise.all(
        panel.bubble_text_coordinates.map(async (bubble) => ({
          text: bubble.text,
          text_tokens: await generateElserTokens(bubble.text),
          bbox: bubble.bbox,
        }))
      );

      console.log(bubblesWithTokens)

      return {
        // follow stucture as sample doc
        audio_url_base64: panel.audio_url_base64, // this
        book_id: panel.book_id,
        bubble_text_coordinates: bubblesWithTokens
        // [ // this sample works though
        //   {
        //     text: "Sample text for text",
        //     text_tokens: {
        //       "30": 3.457,
        //       "56": 4.488,
        //       "85": 7.976,
        //       "92": 8.568,
        //       "99": 6.024,
        //     },
            
        //   },
        // ]
        ,
        chapter_number: panel.chapter_number,
        chapter_title: panel.chapter_title,
        created_at: panel.created_at,
        image_url_base64: panel.image_url_base64, // this
        ocr_text: panel.ocr_text,
        panel_number: panel.panel_number,

        // book_id: panel.book_id,
        // chapter_title: panel.chapter_title,
        // chapter_number: panel.chapter_number,
        // panel_number: panel.panel_number,
        // ocr_text: panel.ocr_text,
        // bubble_text_coordinates: bubblesWithTokens,
        // image_url_base64: panel.image_url_base64,
        // audio_url_base64: panel.audio_url_base64,
        // created_at: panel.created_at
      };
    })
  );

  console.log(panelsWithTokens);
  console.log(panelsWithTokens);

  // Bulk index
  const bulkIngestResponse = await client.helpers.bulk({
    index: "comic-panels",
    datasource: panelsWithTokens,
    timeout: "5m",
    onDocument(doc) {
      return {
        index: {
          _index: "comic-panels",
          _id: `${doc.book_id}-${doc.panel_number}-${doc.chapter_number}`,
        },
      };
    },
  });

  console.log(`Indexed ${panelsWithTokens.length} panels`);

  return NextResponse.json({
    success: true,
    message: "Panels saved to Elasticsearch with ELSER tokens",
    data: bulkIngestResponse,
  });
}

// GET /api/panels?book_id={book_id} get panels by book_id
export async function GET(req) {
  const client = new Client({
    node: process.env.ELASTIC_URL,
    auth: {
      apiKey: process.env.ELASTIC_API_KEY,
    },
    serverMode: "serverless",
  });

  // get book_id from query params
  const { searchParams } = new URL(req.url);
  const book_id = searchParams.get("book_id");
  const chapter_number = searchParams.get("chapter_number");

  if (!book_id) {
    return NextResponse.json({ error: "Missing book_id" }, { status: 400 });
  }
  if (!chapter_number) {
    return NextResponse.json(
      { error: "Missing chapter_number" },
      { status: 400 }
    );
  }

  const searchResponse = await client.search({
    index: "comic-panels",
    body: {
      size: 1000,
      query: {
        bool: {
          must: [
            { term: { "book_id": book_id } },
            { term: { chapter_number: chapter_number } },
            
          ],
        },
      },
      sort: [{ panel_number: { order: "asc" } }],
    },
  });

  return NextResponse.json({
    success: true,
    message: "Panels retrieved from Elasticsearch",
    book_id: book_id,
    data: searchResponse.hits.hits,
  });
}

const sampleDoc = [
  {
    audio_url_base64: "sample-keyword-audio_url_base64",
    book_id: "sample-keyword-book_id",
    bubble_text_coordinates: [
      {
        text: "Sample text for text",
        text_tokens: {
          "30": 3.457,
          "56": 4.488,
          "85": 7.976,
          "92": 8.568,
          "99": 6.024,
        },
      },
    ],
    chapter_number: 89,
    chapter_title:
      "Yellowstone National Park is one of the largest national parks in the United States. It ranges from the Wyoming to Montana and Idaho, and contains an area of 2,219,791 acress across three different states. Its most famous for hosting the geyser Old Faithful and is centered on the Yellowstone Caldera, the largest super volcano on the American continent. Yellowstone is host to hundreds of species of animal, many of which are endangered or threatened. Most notably, it contains free-ranging herds of bison and elk, alongside bears, cougars and wolves. The national park receives over 4.5 million visitors annually and is a UNESCO World Heritage Site.",
    created_at: "2025-10-05T05:25:47.714Z",
    image_url_base64: "sample-keyword-image_url_base64",
    ocr_text:
      "Yellowstone National Park is one of the largest national parks in the United States. It ranges from the Wyoming to Montana and Idaho, and contains an area of 2,219,791 acress across three different states. Its most famous for hosting the geyser Old Faithful and is centered on the Yellowstone Caldera, the largest super volcano on the American continent. Yellowstone is host to hundreds of species of animal, many of which are endangered or threatened. Most notably, it contains free-ranging herds of bison and elk, alongside bears, cougars and wolves. The national park receives over 4.5 million visitors annually and is a UNESCO World Heritage Site.",
    panel_number: 80,
  },
  {
    audio_url_base64: "sample-keyword-audio_url_base64",
    book_id: "sample-keyword-book_id",
    bubble_text_coordinates: [
      {
        text: "Sample text for text",
        text_tokens: {
          "32": 5.093,
          "33": 4.882,
          "43": 8.538,
          "54": 6.63,
          "93": 3.188,
        },
      },
    ],
    chapter_number: 42,
    chapter_title:
      "Yosemite National Park is a United States National Park, covering over 750,000 acres of land in California. A UNESCO World Heritage Site, the park is best known for its granite cliffs, waterfalls and giant sequoia trees. Yosemite hosts over four million visitors in most years, with a peak of five million visitors in 2016. The park is home to a diverse range of wildlife, including mule deer, black bears, and the endangered Sierra Nevada bighorn sheep. The park has 1,200 square miles of wilderness, and is a popular destination for rock climbers, with over 3,000 feet of vertical granite to climb. Its most famous and cliff is the El Capitan, a 3,000 feet monolith along its tallest face.",
    created_at: "2025-10-05T05:25:47.714Z",
    image_url_base64: "sample-keyword-image_url_base64",
    ocr_text:
      "Yosemite National Park is a United States National Park, covering over 750,000 acres of land in California. A UNESCO World Heritage Site, the park is best known for its granite cliffs, waterfalls and giant sequoia trees. Yosemite hosts over four million visitors in most years, with a peak of five million visitors in 2016. The park is home to a diverse range of wildlife, including mule deer, black bears, and the endangered Sierra Nevada bighorn sheep. The park has 1,200 square miles of wilderness, and is a popular destination for rock climbers, with over 3,000 feet of vertical granite to climb. Its most famous and cliff is the El Capitan, a 3,000 feet monolith along its tallest face.",
    panel_number: 89,
  },
  {
    audio_url_base64: "sample-keyword-audio_url_base64",
    book_id: "sample-keyword-book_id",
    bubble_text_coordinates: [
      {
        text: "Sample text for text",
        text_tokens: {
          "1": 2.644,
          "32": 6.023,
          "39": 3.86,
          "40": 2.113,
          "45": 4.517,
        },
      },
    ],
    chapter_number: 68,
    chapter_title:
      "Rocky Mountain National Park  is one of the most popular national parks in the United States. It receives over 4.5 million visitors annually, and is known for its mountainous terrain, including Longs Peak, which is the highest peak in the park. The park is home to a variety of wildlife, including elk, mule deer, moose, and bighorn sheep. The park is also home to a variety of ecosystems, including montane, subalpine, and alpine tundra. The park is a popular destination for hiking, camping, and wildlife viewing, and is a UNESCO World Heritage Site.",
    created_at: "2025-10-05T05:25:47.714Z",
    image_url_base64: "sample-keyword-image_url_base64",
    ocr_text:
      "Rocky Mountain National Park  is one of the most popular national parks in the United States. It receives over 4.5 million visitors annually, and is known for its mountainous terrain, including Longs Peak, which is the highest peak in the park. The park is home to a variety of wildlife, including elk, mule deer, moose, and bighorn sheep. The park is also home to a variety of ecosystems, including montane, subalpine, and alpine tundra. The park is a popular destination for hiking, camping, and wildlife viewing, and is a UNESCO World Heritage Site.",
    panel_number: 98,
  },
];
