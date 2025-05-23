export async function GET(request: Request,{params}:{
  params: Promise<{ id : string }>
}) {
  
  const  id = (await params).id

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
  const {body,id,state} = data;


  try{

    const backend = process.env.NEXT_PUBLIC_BACKEND_API
    const auth = process.env.NEXT_PUBLIC_BACKEND_AUTH

    // Second fetch with the session ID included in the headers as a cookie
    const dataResponse = await fetch(backend + `/api/transfer/${id}/${state}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + auth,
      },
      body: JSON.stringify(body)
    });
    console.log(body,id,state)
    console.log(`/api/pos/transfers/${id}/${state}`)
    return Response.json(dataResponse);
  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

}

