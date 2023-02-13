// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import moment from "moment";

type Data = {
  name?: string;
};

const selectQuery = `
  *,
  discipler_id (*) 
`;

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

  if (req.method === "POST") {
    return save(req, res);
  }

  if (req.method === "GET") {
    return get(req, res);
  }

  return res.status(404).json({});
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const query = supabase.from("networks").select(selectQuery);
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

  if (req.query.discipler_id) {
    let leader = [req.query.discipler_id];

    if (Array.isArray(req.query.discipler_id)) {
      leader = req.query.discipler_id;
    }

    orQuery.push(`discipler_id.in.(${leader.join(",")})`);
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

  const response = await Promise.all(
    data.map(async (item) => {
      const res = await supabase
        .from("network_disciples")
        .select("*", { count: "exact", head: true })
        .eq("network_id", item.id);

      return { ...item, member_count: res.count };
    })
  );

  return res.status(200).json(response);
}

async function save(req: NextApiRequest, res: NextApiResponse) {
  const fields = ["name", "discipler_id"];

  const payload: { [key: string]: string } = {};

  fields.forEach((key) => {
    if (!!req.body[key]) {
      payload[key] = req.body[key];
    }
  });

  const { error, data } = await supabase
    .from("networks") //
    .insert(payload as unknown)
    .select(`*, discipler_id(*)`)
    .single();

  if (error) {
    // ENHANCEMENTS: stuctured logging
    return res.status(400).json({});
  }

  res.status(200).json(data);
}
