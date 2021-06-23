let AV = require("./masterKey");
let {Thread} = require("@meislzhua/promise-pool");

const query = new AV.Query('GoalHistory');
query.doesNotExist("goalSnapshoot");
query.include('goal');

(async () => {
  let historys = await query.find();
  console.log("共有:" + historys.length)
  let pool = new Thread({threadCount:5});

  let tasks = historys.map(async history =>{
    history.set("goalSnapshoot", history.get("goal")?.toJSON())
    await pool.run(()=> history.save())
  })
  await Promise.all(tasks);

  // for (let history of historys) {
  //   history.set("goalSnapshoot", history.get("goal")?.toJSON())
  //   await history.save()
  // }

  console.log("处理完成")
})();
