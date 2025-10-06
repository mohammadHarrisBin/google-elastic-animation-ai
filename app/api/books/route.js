import { NextResponse } from "next/server";
import { Client } from "@elastic/elasticsearch";

export async function POST(req) {
  const client = new Client({
    node: process.env.ELASTIC_URL,
    auth: {
      apiKey: process.env.ELASTIC_API_KEY,
    },
    serverMode: 'serverless',
  });
  // test connection
  await client.ping();
  console.log('Connected to Elasticsearch');

  const { bookMetaData } = await req.json();
  
  // save book to elasticsearch 

//   const bookMetaData = bookMetaDataList[0];
  
    const bookIndexResponse = await client.index({
    index: 'comic-books',
    document: bookMetaData,
  });

  return NextResponse.json({ 
    success: true, 
    message: 'Book saved to Elasticsearch',
    data: bookIndexResponse,
  });
}



// get all books for display to admin
export async function GET() {
  const client = new Client({
    node: process.env.ELASTIC_URL,
    auth: {
      apiKey: process.env.ELASTIC_API_KEY,
    },
    serverMode: 'serverless',
  });
  // test connection
  await client.ping();
  console.log('Connected to Elasticsearch');

  const result = await client.search({
        index: 'comic-books',
        size: 100,
        _source: ["title", "author", "language", "image_art_base_64", "created_at"],
        query: {
            match_all: {}
        }
    });
  console.log(result)

  return NextResponse.json({ 
    success: true, 
    message: 'Books retrieved from Elasticsearch',
    data: result.hits.hits,
  });
}
