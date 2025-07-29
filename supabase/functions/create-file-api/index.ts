import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { files, group, series } = await req.json();

    const sb = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // 1) Create new series if grouping
    let collectionId: string | null = null;
    if (group && series?.title) {
      const { data: col, error: colErr } = await sb
        .from("file_collections")
        .insert({
          creator_id: series.creatorId,
          title:      series.title,
          slug:       series.slug,
          description: series.description || null,
          price_cents: 0
        })
        .select("id")
        .single();
      if (colErr) throw colErr;
      collectionId = col.id;
    }

    // 2) Insert files with or without collection
    const payload = files.map((f: any) => ({
      creator_id:      f.creatorId,
      collection_id:   collectionId,
      file_name:       f.fileName,
      file_url:        f.fileUrl,
      file_size_bytes: f.fileSize,
      content_type:    f.contentType,
      slug:            f.slug,
      description:     f.description || null,
      price_cents:     0
    }));

    const { data: created, error: insErr } = await sb
      .from("files")
      .insert(payload);

    if (insErr) throw insErr;

    return new Response(JSON.stringify({ created }), {
      headers: { ...CORS, "Content-Type": "application/json" },
      status: 201,
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...CORS, "Content-Type": "application/json" },
      status: 400,
    });
  }
});