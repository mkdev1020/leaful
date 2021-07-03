
const guestRoutes = [
  '/test/homepage-layout',
  '/test/captcha',
  '/test/upload',
  '/admin', // XXX
  '/test/sign-up', // XXX
];

export default async function (context) {
  const { $sdk, route, redirect, from } = context;
  console.log("what content does context contains...")
  console.log(context);
  if (guestRoutes.includes(route.path)) {
    return;
  }

  if ($sdk.isAuthenticated()) {
    return true;
  }

  await $sdk.promptAuthentication(route.path);

  if (route.path === from.path) {
    return redirect('/test/homepage-layout');
  }

  return redirect(from.path);
}
