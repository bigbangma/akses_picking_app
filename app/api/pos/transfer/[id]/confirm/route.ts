export async function GET(request: Request,{params}: {params: {id: string}}) {
  const { id } = params;

  try {

    const backend = process.env.NEXT_PUBLIC_BACKEND_API
    const auth = process.env.NEXT_PUBLIC_BACKEND_AUTH

    // Second fetch with the session ID included in the headers as a cookie
    const dataResponse = await fetch(backend + `/api/pos/${id}/transfers`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + auth,
      },
    });


    const data = await dataResponse.json();

    return Response.json(data);
  } catch (error) {
    console.error("Error in GET request:", error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


export async function POST(request: Request) {
  const data = await request.json()
  const {body,id} = data;


  try{

    const backend = process.env.NEXT_PUBLIC_BACKEND_API
    const auth = process.env.NEXT_PUBLIC_BACKEND_AUTH

    // Second fetch with the session ID included in the headers as a cookie
    const dataResponse = await fetch(backend + `/api/transfer/${id}/done`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + auth,
      },
      body: JSON.stringify(body)
    });
    console.log(body,id)
    console.log(`/api/pos/transfers/${id}/confirm`)
    console.log(dataResponse.json())
    return Response.json(dataResponse);
  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

}