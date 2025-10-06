import { Client } from "@elastic/elasticsearch";
import { NextResponse } from "next/server";

export async function POST(req) {
  const client = new Client({
    node: process.env.ELASTIC_URL,
    auth: {
      apiKey: process.env.ELASTIC_API_KEY,
    },
    serverMode: "serverless",
  });

  const { query, bookId } = await req.json();

  if (!query) return NextResponse.json({ error: "query is required" });

  const mustClauses = [];
  if (bookId) {
    mustClauses.push({ term: { "book_id": bookId } });
  }

  const response = await client.search({
    index: "comic-panels",
    body: {
      query: {
        bool: {
          must: mustClauses,
          should: [
            // Search top-level ocr_text with semantic
            {
              semantic: {
                field: "ocr_text",
                query: query
              }
            },
            // Search bubble text with ELSER
            {
              nested: {
                path: "bubble_text_coordinates",
                query: {
                  text_expansion: {
                    "bubble_text_coordinates.text_tokens": {
                      model_id: ".elser-2-elastic",
                      model_text: query
                    }
                  }
                },
                inner_hits: {
                  _source: ["text", "bbox"],
                  size: 5
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      _source: [
        "book_id",
        "chapter_number",
        "panel_number",
        "image_url_base64",
        "bubble_text_coordinates"
      ],
      size: 20
    }
  });

  console.log(response.hits.hits[0].inner_hits?.bubble_text_coordinates?.hits?.hits[0]._source);

  // Format results to include matched bubbles
  const results = response.hits.hits.map(hit => ({
  id: hit._id,
  score: hit._score,
  ...hit._source,
  matched_bubbles: hit.inner_hits?.bubble_text_coordinates?.hits?.hits?.map(bubble => {
    // Use the offset to find the actual bubble in the parent document
    const bubbleIndex = bubble._nested.offset;
    const actualBubble = hit._source.bubble_text_coordinates?.[bubbleIndex];
    
    return {
      text: actualBubble?.text,
      bbox: actualBubble?.bbox,
      score: bubble._score
    };
  }) || []
}));

  return NextResponse.json({ 
    results,
    total: response.hits.total.value 
  });
}