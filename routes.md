  <!-- app.use("/", (req, res) => {
    res.send("Home page");
  });  this will not route to next
  {
  app.use("/home", (req, res) => {
    res.send("Hello server is running");
  });
  app.use("/dashboard", (re1, res) => {
    res.send("welcome to dashboard");
  });
  app.use("/chat/private", (req, res) => {
    res.send("You are in private chat ");
  });   this will work bcoz order of code matters...
  app.use("/chat", (req, res) => {
    res.send("You are in chat ");
  });
    app.use("/chat/private", (req, res) => {
      res.send("You are in private chat ");
    }); not wok here
  app.use("/profile", (req, res) => {
    res.send("Profile is here need to update?");
  });
  app.use("/login", (req, res) => {
    res.send("Login page enter credentials");
  });
  app.use("/signup", (req, res) => {
    res.send("Signup page enter credentials");
  });
  app.use("/", (req, res) => {
    res.send("Home page");
  });   becoz of order the / is here
  } -->
