// .netlify/functions/saveAvailability.js
export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);

    // TODO: Replace this with actual saving logic (database, file, etc.)
    console.log("Received availability data:", data);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data saved successfully!" })
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON" })
    };
  }
}
