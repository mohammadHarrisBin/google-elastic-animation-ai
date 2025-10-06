import { NextResponse } from "next/server";
import { Client } from "@elastic/elasticsearch";


// get one books for display to admin with search params of book_id
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

  const searchResponse = await client.search({
    index: "comic-books",
    body: {
      size: 1,
      query: {
        term: {
          _id: book_id,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Book retrieved from Elasticsearch",
    book_id: book_id,
    // data
    data: searchResponse.hits.hits[0]._source,
  });
}
