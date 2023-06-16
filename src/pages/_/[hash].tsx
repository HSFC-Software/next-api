import { GetServerSidePropsContext } from "next";
import { supabase } from "@/lib/supabaseClient";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const reference = context.query.hash;
  const { data, error } = await supabase
    .from("school_registrations")
    .select("*")
    .eq("reference", reference)
    .single();

  const destination = `https://app.fishgen.org/sdl/admission/${data?.course_id}/${data?.id}`;

  return {
    redirect: {
      destination,
      permanent: false, // Set it to true for permanent redirects
    },
    props: {},
  };
}

const Shorten = () => {
  return <></>;
};

export default Shorten;
