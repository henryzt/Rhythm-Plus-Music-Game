import demoJson from "./timelineDemo.json";

export const demo = demoJson;

export function startDemo(instance, demoNum) {
  switch (demoNum) {
    case 1:
      instance.startSong({
        url: "songs/whywelose.mp3",
        srcMode: "url",
        visualizerNo: 3,
        timeArr: loadFromDemo("whywelose"),
      });
      break;

    case 2:
      instance.startSong({
        url: "songs/sheepdog.mp3",
        srcMode: "url",
        visualizerNo: 2,
        timeArr: loadFromDemo("sheepdog"),
      });
      break;

    case 3:
      instance.startSong({
        youtubeId: "OFS3OYNs7U4",
        srcMode: "youtube",
        visualizerNo: 0,
        timeArr: loadFromDemo("bronson"),
      });
      break;

    default:
      throw new Error("unexpected demo number: must be between 1 and 3");
  }
}

export function loadFromDemo(name) {
  if (demoJson && demoJson[name]) {
    return demoJson[name].timeline;
  }
  throw new Error(`unexpected demo name: "{name}" not found`);
}
