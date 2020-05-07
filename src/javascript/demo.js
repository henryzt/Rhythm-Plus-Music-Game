import demoJson from "./timelineDemo.json";
import { loadFromDemo } from "./storage";

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
        visualizerNo: 2,
        timeArr: loadFromDemo("bronson"),
      });
      break;
  }
}
