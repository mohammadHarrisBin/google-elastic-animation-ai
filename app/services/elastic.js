// connect to elastic client


// 'use server';

// import { Client } from "@elastic/elasticsearch";

// export const connectElasticClient = () => new Client({
//   node: process.env.ELASTIC_NODE,
//   auth: {
//     apiKey: process.env.ELASTIC_API_KEY,
//   },
//   serverMode: 'serverless',
// });

// const timeout = '5m';
// const INDEX = 'comic-panels'; // Changed to uppercase for constant

// // save panels to elastic search
// export const savePanel = async(panelMetaDataList) => {
//   const bulkIngestResponse = await client.helpers.bulk({
//     index: INDEX, // ✅ Using the index constant
//     datasource: panelMetaDataList,
//     timeout,
//     onDocument(doc) {
//       return {
//         index: { _index: INDEX }, // ✅ Explicitly specify index for each document
//       };
//     }
//   }); 
//   return bulkIngestResponse;
// }