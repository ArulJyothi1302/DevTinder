  <!-- Route Handlers

  app.use(
    "/user",
    [
        can able to put inside the array entirely or as many  route handlers needed in array and each route handler into an array
      (req, res, next) => {
         ->middleware
          console.log("Welcome to server");  if there is no response it will hang.
          next();

          res.send("1st Resp");   if there is no response here it not jump to next response for it we have to use next()
        next();
          res.send("1st resp is here");
      },
      (req, res, next) => {
          -> middleware
          if there is no response while using next the 2nd response will run if there is already a resp in it and using next only 1st resp will run and it throw an err
        console.log("2nd Route is here");

        next();
          res.send("2nd Resp is here");
      },
    ],
    (req, res, next) => {
       -> request handler
      console.log("3rd route");
      res.send("3rs resp");
        next();
    }
  ); -->
