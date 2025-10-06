import { Client } from "@elastic/elasticsearch";
import { NextResponse } from "next/server";

// get chapters

// GET /api/chapters?book_id={book_id} get chapters by book_id
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

  if (!book_id) {
    return NextResponse.json({ error: "Missing book_id" }, { status: 400 });
  }

  // get all panels regardless of id



  const searchResponse = await client.search({
    index: "comic-panels",
    body: {
      size: 10,
      query: {
      // get all chapters by book_id
      bool: {
        must: [
          {
            term: { "book_id": book_id }
          }
        ],
      },
        // term: {
        //   "book_id.keyword": book_id,
        // },
      },
      aggs: {
        title: {
          terms: {
            field: "chapter_title",
          },
        },
        chapters: {
          terms: {
            field: "chapter_number",
            size: 100,
            order: { _key: "asc" },
          },
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Chapters retrieved from Elasticsearch",
    book_id: book_id,
    // data
    titles: searchResponse.aggregations.title.buckets,
    chapters: searchResponse.aggregations.chapters.buckets,
  });
}
