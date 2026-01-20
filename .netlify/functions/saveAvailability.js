import fetch from "node-fetch";

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);

    // 1️⃣ Fetch current availability.json from GitHub
    const repo = "Echo-Frontier/echo-frontier-website";
    const path = "availability.json";
    const branch = "main";

    const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json"
      }
    });

    let sha;
    let existingData = [];

    if (getRes.status === 200) {
      const fileJson = await getRes.json();
      sha = fileJson.sha; // required to update file
      existingData = JSON.parse(Buffer.from(fileJson.content, 'base64').toString());
    }

    // 2️⃣ Append new submission
    existingData.push(data);

    // 3️⃣ Commit updated file
    const commitRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        message: `Update availability - ${new Date().toISOString()}`,
        content: Buffer.from(JSON.stringify(existingData, null, 2)).toString("base64"),
        sha: sha || undefined,
        branch: branch
      })
    });

    const commitJson = await commitRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Availability saved successfully!" })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save availability" })
    };
  }
}

