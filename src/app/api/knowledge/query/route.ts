import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      token,
      model,
      kbList,
      stream = false,
      documents = [],
      temperature = 0.7,
      max_tokens = 2000,
      response_format = "text",
    } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "API 令牌是必需的" }, { status: 400 });
    }

    if (!Array.isArray(kbList) || kbList.length === 0) {
      return NextResponse.json(
        { error: "知识库 ID 是必需的" },
        { status: 400 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "消息是必需的" }, { status: 400 });
    }

    // 调用知识检索 API
    const response = await fetch(
      "https://edge.flowith.net/external/use/seek-knowledge",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Host: "edge.flowith.net",
        },
        body: JSON.stringify({
          messages,
          model,
          stream,
          kb_list: kbList,
          document_ids: documents,
          temperature,
          max_tokens,
          response_format,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API 返回 ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API 路由错误:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "发生未知错误" },
      { status: 500 }
    );
  }
}
