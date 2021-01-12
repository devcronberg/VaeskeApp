import * as settings from "./settings.js";

$(document).ready(async () => {
  let visDataForDato = new Date().toISOString().substr(0, 10);

  idb.openDB("vaeskeData", 3, {
    upgrade(db, oldVersion, newVersion, transaction) {
      db.createObjectStore("indtaget", {
        keyPath: "id",
        autoIncrement: true,
      });
      const store = transaction.objectStore("indtaget");
      store.createIndex("dagIndex", "dag");
      store.createIndex("tidIndex", "tid");
    },
  });

  visSum(visDataForDato);

  const knapperDiv = $("#knapper");
  settings.vaeskeData.forEach((v) => {
    const knapKontroller = opretDivMedKnap(v.navn, "vaeskeData", v);
    knapperDiv.append(knapKontroller[0]);
    $(knapKontroller[1]).click(async function () {
      const db = await idb.openDB("vaeskeData", 3);
      const date = new Date();
      db.add("indtaget", {
        dag: date.toISOString().substr(0, 10),
        tid: date.toISOString().substr(11, 8),
        vaeskeData: $(this).data("vaeskeData"),
      });
      db.close();
      visSum(visDataForDato);
    });
  });

  function opretDivMedKnap(html, dataKey, dataValue) {
    const div = $("<div />");
    const knap = $("<button />");
    knap.html(html);
    knap.data(dataKey, dataValue);
    div.append(knap);
    return [div, knap];
  }

  async function visSum(dato) {
    const db = await idb.openDB("vaeskeData", 3);
    const rng = IDBKeyRange.only(dato);
    let indtaget = await db.getAllFromIndex("indtaget", "dagIndex", rng);
    db.close();
    let sum = 0;
    const ul = $("<ul/>");
    indtaget.forEach((v) => {
      sum += v.vaeskeData.indhold;
      let li = $("<li />").html(`
         ${v.tid} ${v.vaeskeData.navn} (${v.vaeskeData.indhold} ml)
       `);
      const a = $("<a href=''>slet</a>");
      a.data("slet", v.id);
      a.click(async function (e) {
        e.preventDefault();
        const db = await idb.openDB("vaeskeData", 3);
        db.delete("indtaget", $(this).data("slet"));
        db.close();
        visSum(visDataForDato);
      });
      li.append(a);
      ul.append(li);
    });

    $("#indtaget").html(ul);
    $("#summering").html(sum + " ml drukket idag");
  }
});
