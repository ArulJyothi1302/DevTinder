const cron = require("node-cron");
const sendEmail = require("./sesSendEmail");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequestModel = require("../models/connectionRequest");

cron.schedule("0 8 * * *", async () => {
  try {
    const yesterDay = subDays(new Date(), 1);
    const yesterDayStart = startOfDay(yesterDay);
    const yesterDayEnd = endOfDay(yesterDay);

    const pendingRequestsYesterday = await ConnectionRequestModel.find({
      status: "interested",
      createdAt: {
        $gte: yesterDayStart,
        $lte: yesterDayEnd,
      },
    }).populate("fromUserId toUserId");

    const listofMails = [
      ...new Set(pendingRequestsYesterday.map((req) => req.toUserId.email)),
    ];

    console.log("emails:", listofMails);
    for (const emails of listofMails) {
      try {
        const res = await sendEmail.run(
          "New Request is pending  in DevHub" + emails,
          "There are devs interested in you to connect with them please login to accept or reject them"
        );
        console.log("resofEmail:", res);
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error("Error in cron job:", err);
  }
});
