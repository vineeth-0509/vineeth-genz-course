// // import { getAuthSession } from "@/lib/auth";
// // import { NextResponse } from "next/server";
// // import { prisma } from "@/lib/db";
// // import { stripe } from "@/lib/stripe";

// import { getAuthSession } from "@/lib/auth";
// import { NextResponse } from "next/server";

// // export async function GET() {
// //   const settingsUrl = process.env.NEXTAUTH_URL + "/settings";
// //   try {
// //     const session = await getAuthSession();
// //     if (!session?.user) {
// //       return new NextResponse("unauthorised", { status: 401 });
// //     }
// //     const userSubscription = await prisma.userSubscription.findUnique({
// //       where: {
// //         userId: session.user.id,
// //       },
// //     });
// //     if (userSubscription && userSubscription.stripeCustomerId) {
// //       const stripeSession = await stripe.billingPortal.sessions.create({
// //         customer: userSubscription.stripeCustomerId,
// //         return_url: settingsUrl,
// //       });
// //       return NextResponse.json({ url: stripeSession.url });
// //     }

// //     const stripeSession: Awaited<ReturnType<typeof stripe.checkout.sessions.create>> = await stripe.checkout.sessions.create({
// //       success_url: settingsUrl,
// //       cancel_url: settingsUrl,
// //       payment_method_types: ["card"],
// //       mode: "subscription",
// //       billing_address_collection: "auto",
// //       customer_email: session.user.email ?? "",
// //       line_items: [
// //         {
// //           price_data: {
// //             currency: "USD",
// //             product_data: {
// //               name: "Vineeth Genz Course",
// //               description: "Unlimited Course Generation",
// //             },
// //             unit_amount:2000,
// //             recurring:{
// //                 interval:"month",
// //             },
// //           },
// //           quantity: 1
// //         },
// //       ],
// //       metadata:{
// //         userId:session.user.id
// //       }
// //     });
// //     return NextResponse.json({url:stripeSession.url});
// //   } catch (error) {
// //     console.log("[STRIPE ERROR]", error);
// //     return new NextResponse("internal server error", {status:500});
// //   }
// // }



// import { prisma } from "@/lib/db";
// import { stripe } from "@/lib/stripe";

// const settingsUrl = process.env.NEXTAUTH_URL + "/settings";

// export async function GET(){
//   try {
//     const session = await getAuthSession();
//     if(!session?.user){
//       return new NextResponse("unauthorised", {status: 401});
//     }
//     const userSubscription = await prisma.userSubscription.findUnique({
//       where:{
//         userId: session.user.id,
//       },
//     });

//     if(userSubscription && userSubscription.stripeCustomerId){
//       const stripeSession = await stripe.billingPortal.sessions.create({
//         customer:userSubscription.stripeCustomerCard,
//         return_url: settingsUrl,
//       });
//       return NextResponse.json({url:stripeSession.url});
//     }
//     const stripeSession = await stripe.checkout.sessions.create({
//       success_url: settingsUrl,
//       cancel_url: settingsUrl,
//       payment_method_types:["card"],
//       mode:"subscription",
//       billing_address_collection:"auto",
//       customer_email: session.user.email ?? "",
//       line_items:[
//         {
//           price_data:{
//             currency:"USD",
//             product_data:{
//               name:"vineeth genz course",
//               description:"unlimited course generation!",
//             },
//             unit_amount : 2000,
//             recurring:{
//               interval:"month"
//             }
//           },
//           quantity:1,
//         },
//       ],
//       metadata:{
//         userId: session.user.id,
//       }
//     });
//     return NextResponse.json({url: stripeSession.url})
//   } catch (error) {
//     console.log("[STRIPE ERROR]", error);
//     return new NextResponse("internal server error", {status: 500})
//   }
// }