// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import moment from "moment";

type Data = {
  name?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: ["http://localhost:3001", "http://localhost:3002"],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  if (req.method === "GET") {
    return get(req, res);
  }

  return res.status(404).json({});
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { error, data } = await supabase
    .from("vips")
    .select(
      `*,
      disciple_id(
        *
      )
    `
    )
    .gt("created_at", moment().subtract("days", 7).utc().toISOString());

  const consolidationsQuery = await Promise.all(
    data?.map(async (item) => {
      const { data } = await supabase
        .from("consolidations")
        .select("disciple_id")
        .eq("lesson_code", "L1")
        .eq("disciple_id", item.disciple_id.id)
        .single();
      return data?.disciple_id;
    }) as []
  );

  const consolidated: string[] = consolidationsQuery.filter((item) => !!item);

  const response = data?.filter((item: any) => {
    if (consolidated.includes(item.disciple_id?.id)) return false;
    return true;
  });

  if (error) {
    // ENHANCEMENTS: stuctured logging
    return res.status(400).json({});
  }

  res.status(200).json(response);
}
