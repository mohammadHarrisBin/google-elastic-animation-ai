'use server';

import { Client } from "@elastic/elasticsearch";

export const client = new Client({
  node: process.env.ELASTIC_NODE,
  auth: {
    apiKey: process.env.ELASTIC_API_KEY,
  },
});

export async function saveDocument(body) {
  try {
    // Add validation here
    if (!body.title || !body.content) {
      return { error: "Missing required fields: title and content" };
    }

    const indexName = "my-nextjs-index";

    const result = await client.index({
      index: indexName,
      document: body,
    });

    console.log("Document indexed:", result);
    return { success: true, result };
  } catch (error) {
    console.error("Elasticsearch error:", error);
    return { error: "Failed to save document", details: error.message };
  }
}
