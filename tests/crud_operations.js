const { app } = require("../app");
const Job = require("../models/Job");
const { seed_db, testUserPassword, factory } = require("../utils/seed_db");
const get_chai = require("../utils/get_chai");
describe("tests for CRUD operations", function () {
  before(async () => {
    const { expect, request } = await get_chai();
    this.test_user = await seed_db();
    let req = request.execute(app).get("/sessions/logon").send();
    let res = await req;
    const textNoLineEnd = res.text.replaceAll("\n", "");
    this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];
    let cookies = res.headers["set-cookie"];
    this.csrfCookie = cookies.find((element) =>
      element.startsWith("csrfToken")
    );
    const dataToPost = {
      email: this.test_user.email,
      password: testUserPassword,
      _csrf: this.csrfToken
    };
    req = request
      .execute(app)
      .post("/sessions/logon")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);
    res = await req;
    cookies = res.headers["set-cookie"];
    this.sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid")
    );
    expect(this.csrfToken).to.not.be.undefined;
    expect(this.sessionCookie).to.not.be.undefined;
    expect(this.csrfCookie).to.not.be.undefined;
  });

  it("should get all entries", async () => {
    const { expect, request } = await get_chai();
    const req = request
      .execute(app)
      .get("/jobs")
      .set("Cookie", this.sessionCookie)
      .send();
    const res = await req;
    expect(res).to.have.status(200);
    const textNoLineEnd = res.text.replaceAll("\n", "");
    this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];
    let cookies = res.headers["set-cookie"];
    this.csrfCookie = cookies.find((element) =>
      element.startsWith("csrfToken")
    );
    const pageParts = res.text.split("<tr>");
    expect(pageParts.length).to.equal(21);
  });

  it("should add a job entry", async () => {
    const { expect, request } = await get_chai();
    const job = await factory.build("job");
    const dataToPost = {
      company: job.company,
      position: job.position,
      status: job.status,
      _csrf: this.csrfToken
    };
    const req = request
      .execute(app)
      .post("/jobs")
      .set("Cookie", this.csrfCookie + ";" + this.sessionCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .send(dataToPost);
    const res = await req;
    expect(res).to.have.status(200);
    const jobs = await Job.find({ createdBy: this.test_user._id });
    expect(jobs.length).to.equal(21);
  });
});
