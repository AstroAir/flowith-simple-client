import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      token,
      model,
      kbList,
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

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
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
                stream: true,
                kb_list: kbList,
                document_ids: documents,
                temperature,
                max_tokens,
                response_format,
              }),
            }
          );

          if (!response.ok) {
            // 向客户端发送错误响应
            const errorText = await response.text();
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  tag: "final",
                  content: `错误: ${response.status} - ${errorText}`,
                })}\n\n`
              )
            );
            controller.close();
            return;
          }

          // 将 API 响应流式传输到客户端
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("响应体不可读");
          }

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            controller.enqueue(value);
          }
        } catch (error) {
          console.error("流式传输错误:", error);

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                tag: "final",
                content: `发生错误: ${
                  error instanceof Error ? error.message : "未知错误"
                }`,
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("路由处理错误:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "发生未知错误" },
      { status: 500 }
    );
  }
}
