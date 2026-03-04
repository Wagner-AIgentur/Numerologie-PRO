import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = adminClient as any;

/**
 * POST /api/voice-agent/tools/knowledge
 * ElevenLabs Server Tool: Searches the Supabase knowledge base (RAG).
 * The voice agent calls this tool to retrieve relevant information
 * about packages, FAQs, services, and customer support topics.
 *
 * Uses PostgreSQL full-text search (tsvector) for sub-10ms queries.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = db;

    const query = body.query || "";
    const category = body.category || null;
    const language = body.language || "de";

    if (!query.trim()) {
      return NextResponse.json({
        results: [],
        message: "Keine Suchanfrage angegeben.",
      });
    }

    // Call the Supabase RPC function for full-text search
    const { data, error } = await supabase.rpc("search_voice_knowledge", {
      query_text: query.trim(),
      query_language: language,
      query_category: category,
      result_limit: 5,
    });

    if (error) {
      console.error("[Voice Agent] Knowledge search error:", error);

      // Fallback: simple keyword search via ilike
      const { data: fallbackData } = await supabase
        .from("voice_knowledge")
        .select("category, subcategory, title_de, content_de, title_ru, content_ru")
        .eq("is_active", true)
        .or(`title_de.ilike.%${query}%,content_de.ilike.%${query}%,title_ru.ilike.%${query}%`)
        .limit(3);

      const fb = fallbackData as Array<{ category: string; subcategory: string; title_de: string; content_de: string; title_ru: string | null; content_ru: string | null }> | null;
      if (fb && fb.length > 0) {
        const results = fb.map((row) => ({
          title: language === "ru" ? (row.title_ru || row.title_de) : row.title_de,
          content: language === "ru" ? (row.content_ru || row.content_de) : row.content_de,
          category: row.category,
        }));

        return NextResponse.json({
          results,
          message: `${results.length} Ergebnis(se) gefunden.`,
        });
      }

      return NextResponse.json({
        results: [],
        message: "Keine passenden Informationen gefunden. Empfehle dem Anrufer, sich auf numerologie-pro.com zu informieren oder das kostenlose Erstgespraech zu buchen.",
      });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        results: [],
        message: "Keine passenden Informationen gefunden. Empfehle dem Anrufer, sich auf numerologie-pro.com zu informieren oder das kostenlose Erstgespraech zu buchen.",
      });
    }

    // Format results for the agent
    const results = (data as Array<{ title: string; content: string; category: string; subcategory: string }>).map((row) => ({
      title: row.title,
      content: row.content,
      category: row.category,
      subcategory: row.subcategory,
    }));

    return NextResponse.json({
      results,
      message: `${results.length} relevante Information(en) gefunden. Nutze diese Informationen fuer deine Antwort.`,
    });
  } catch (error) {
    console.error("[Voice Agent] Knowledge tool error:", error);
    return NextResponse.json({
      results: [],
      message: "Wissensdatenbank voruebergehend nicht erreichbar. Empfehle das kostenlose Erstgespraech oder die Website numerologie-pro.com.",
    });
  }
}
