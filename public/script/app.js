let visDataForDato = dayjs(dayjs().format("YYYY-MM-DD"));

const vaeskeData = [
  {
    navn: "Lille kop",
    indhold: 100,
  },
  {
    navn: "Mellem kop",
    indhold: 200,
  },
  {
    navn: "Stor kop",
    indhold: 300,
  },
  {
    navn: "Lille flaske",
    indhold: 330,
  },
  {
    navn: "Mellem flaske",
    indhold: 500,
  },
  {
    navn: "Stor flaske",
    indhold: 1000,
  },
  {
    navn: "Kæmpe flaske",
    indhold: 1500,
  },
];

const navigationData = [
  {
    navn: "Se dagen før",
    funktion: () => (visDataForDato = visDataForDato.subtract(1, "day")),
  },
  {
    navn: "Se idag",
    funktion: () => (visDataForDato = dayjs(dayjs().format("YYYY-MM-DD"))),
  },
  {
    navn: "Se dagen efter",
    funktion: () => (visDataForDato = visDataForDato.add(1, "day")),
  },
];

$(document).ready(async () => {
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

  const knapperVaeske = $("#knapper");
  vaeskeData.forEach((v) => {
    const knapKontroller = opretDivMedKnap(
      v.navn + " <br />(" + v.indhold + " ml)",
      "vaeskeData",
      v
    );
    knapperVaeske.append(knapKontroller[0]);
    $(knapKontroller[1]).click(async function () {
      const db = await idb.openDB("vaeskeData", 3);
      db.add("indtaget", {
        dag: visDataForDato.format("YYYY-DD-MM"),
        tid: dayjs().format("HH:mm:ss"),
        vaeskeData: $(this).data("vaeskeData"),
      });
      db.close();
      visSum(visDataForDato);
    });
  });

  const knapperNavigation = $("#navigation");
  navigationData.forEach((v) => {
    const knapKontroller = opretDivMedKnap(v.navn);
    knapperNavigation.append(knapKontroller[0]);
    $(knapKontroller[1]).click(function () {
      v.funktion();
      visNavigationKnapper();
      visSum(visDataForDato);
    });
  });

  visSum(visDataForDato);

  function opretDivMedKnap(html, dataKey, dataValue) {
    const div = $("<div />");
    const knap = $("<button />");
    knap.html(html);
    knap.data(dataKey, dataValue);
    div.append(knap);
    return [div, knap];
  }

  function visNavigationKnapper() {
    const knapIdag = $("#navigation div:nth-child(2)");
    const knapFrem = $("#navigation div:nth-child(3)");
    knapIdag.show();
    knapFrem.show();

    if (visDataForDato.isSame(dayjs(dayjs().format("YYYY-MM-DD")))) {
      knapIdag.hide();
      knapFrem.hide();
      return;
    }
    if (visDataForDato.isSame(dayjs(dayjs().subtract(1, "day").format("YYYY-MM-DD")))) {
      knapFrem.hide();
      return;
    }
  }

  async function visSum() {
    const db = await idb.openDB("vaeskeData", 3);
    const rng = IDBKeyRange.only(visDataForDato.format("YYYY-DD-MM"));
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
    $("#summering").html(visDataForDato.format("D/M-YY") + " er der drukket " + sum + " ml");
  }
});
