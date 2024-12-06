  <!-- Http Methods
  app.use("/user", (req, res) => res.send("User profile")); all the below http method  will not work due to order of the code
  {app.use("/home", (req, res) => {
    res.send("Hello to the server");
  });
  app.get("/user", (req, res) => {
    res.send({ fName: "Arul", lName: "Jyothi" });
  });
  app.post("/user", (req, res) => {
    res.send("Posted succcesfully");
  });
  app.put("/user", (req, res) => res.send("Put-Updated Succesully"));
  app.use("/test", (req, res) => res.send("Testing will be done here"));
  app.get("/ab?c", (req, res) => res.send("Vannam"));
  app.get("/ab+c", (req, res) => res.send("Vannam cloud"));
  app.get("/ab*cd", (req, res) => res.send("Vannam megam"));
  } -->
