// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

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

  if (req.method === "POST") {
    return save(req, res);
  }

  if (req.method === "PATCH") {
    return update(req, res);
  }

  return res.status(404).json({});
}

const selectQuery = `
*,
disciples_id (
  id,
  first_name,
  last_name
)
`;

async function update(req: NextApiRequest, res: NextApiResponse) {
  const fields = ["lesson_code", "created_at"];

  const payload = {};

  fields.forEach((key) => {
    if (!!req.body[key]) {
      (payload as any)[key] = req.body[key];
    }
  });

  const consolidation = await supabase
    .from("consolidators") //
    .update(payload)
    .eq("id", req.query.id)
    .select(selectQuery)
    .single();

  res.status(200).json(consolidation.data ?? {});
}

async function getById(req: NextApiRequest, res: NextApiResponse) {
  const { data } = await supabase
    .from("consolidators")
    .select(selectQuery)
    .filter("id", "eq", req.query.id)
    .single();

  res.status(200).json(data ?? {});
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  // TODO: GET via q for auto completion

  if (req.query.id) {
    return getById(req, res);
  }

  const { data } = await supabase
    .from("consolidators") //
    .select(selectQuery);

  const response: any = await Promise.all(
    data?.map(async (item) => {
      const res = await supabase
        .from("consolidators_lesson")
        .select(`code`)
        .eq("consolidators_id", item.id);

      const consolidators_lesson = Array.from(
        new Set(res.data?.map((conso) => conso.code))
      ).sort();

      return {
        ...item,
        consolidators_lesson,
      };
    }) as []
  );

  return res.status(200).json(response);
}

async function save(req: NextApiRequest, res: NextApiResponse) {
  const fields = ["disciples_id"];

  const payload: { [key: string]: string } = {};

  fields.forEach((key) => {
    if (!!req.body[key]) {
      payload[key] = req.body[key];
    }
  });

  const { error, data } = await supabase
    .from("consolidators") //
    .insert(payload as unknown)
    .select()
    .single();

  await supabase.from("consolidators_lesson").insert({
    code: "L1",
    consolidators_id: data.id,
  });

  if (error) {
    console.log(error);
    // ENHANCEMENTS: stuctured logging
    return res.status(400).json({});
  }

  res.status(200).json({});
}
