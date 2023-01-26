// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    return get(req, res);
  }

  if (req.method === "POST") {
    return save(req, res);
  }

  return res.status(404).json({});
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { data } = await supabase.from("consolidations") //
    .select(`
      *,
      consolidator_id (
        first_name,
        last_name
      ),
      disciple_id (
        first_name,
        last_name
      )
    `);

  return res.status(200).json(data);
}

async function save(req: NextApiRequest, res: NextApiResponse) {
  const fields = ["consolidator_id", "disciple_id", "lesson_code"];

  const payload: { [key: string]: string } = {};

  fields.forEach((key) => {
    if (!!req.body[key]) {
      payload[key] = req.body[key];
    }
  });

  const { error } = await supabase
    .from("consolidations") //
    .insert(payload as unknown);

  if (error) {
    // ENHANCEMENTS: stuctured logging
    return res.status(400).json({});
  }

  res.status(200).json({});
}
