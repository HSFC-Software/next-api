// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/lib/supabaseClient";
import moment from "moment";
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
consolidator_id (
  id,
  first_name,
  last_name
),
disciple_id (
  id,
  first_name,
  last_name
),
lesson_code (
  name,
  code
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
    .from("consolidations") //
    .update(payload)
    .eq("id", req.query.id)
    .select(selectQuery)
    .single();

  res.status(200).json(consolidation.data ?? {});
}

async function getById(req: NextApiRequest, res: NextApiResponse) {
  const { data } = await supabase
    .from("consolidations")
    .select(selectQuery)
    .filter("id", "eq", req.query.id)
    .single();

  res.status(200).json(data ?? {});
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.id) {
    return getById(req, res);
  }

  const query = supabase.from("consolidations").select(selectQuery);
  const orQuery = [];
  let sortBy = "created_at";
  let order = req.query.order ?? "desc";

  if (req.query.sortBy) {
    sortBy = req.query.sortBy[0];

    if (Array.isArray(req.query.sortBy)) {
      sortBy = req.query.sortBy[0];
    } else {
      sortBy = req.query.sortBy;
    }
  }

  if (req.query.lesson) {
    let lessons = [req.query.lesson];

    if (Array.isArray(req.query.lesson)) {
      lessons = req.query.lesson;
    }

    orQuery.push(`lesson_code.in.(${lessons.join(",")})`);
  }

  if (req.query.consolidator) {
    let consolidators = [req.query.consolidator];

    if (Array.isArray(req.query.consolidator)) {
      consolidators = req.query.consolidator;
    }

    orQuery.push(`consolidator_id.in.(${consolidators.join(",")})`);
  }

  if (req.query.dateStart && req.query.dateEnd) {
    const dateStart = `created_at.gte.${moment(req.query.dateStart)
      .subtract("days", 1)
      .utc()
      .toISOString()}`;

    const dateEnd = `created_at.lte.${moment(req.query.dateEnd)
      .add("days", 1)
      .utc()
      .toISOString()}`;

    orQuery.push(`and(${dateStart},${dateEnd})`);
  }

  if (orQuery.length > 0) query.or(orQuery.join(","));

  query.order(sortBy, { ascending: order === "asc" });

  const { data, error } = await query;

  if (error) {
    return res.status(404).json({});
  }

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
    console.log(error);
    // ENHANCEMENTS: stuctured logging
    return res.status(400).json({});
  }

  res.status(200).json({});
}
