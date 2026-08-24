import dotenv from "dotenv";
dotenv.config();
import { getMainModels } from "../models/cmsSchemas";

async function run() {
  try {
    const { Menu } = await getMainModels();

    // 1. Header Menus
    const allHeader = await Menu.find({ location: "header", isDeleted: false });
    const parents = allHeader
      .filter((m) => !m.parent || m.parent.trim() === "" || m.parent === "None")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    for (let i = 0; i < parents.length; i++) {
      const p = parents[i];
      await Menu.findByIdAndUpdate(p._id, { order: i + 1 });

      const pTitle = (p.title || "").trim().toLowerCase();
      const pId = p._id.toString();
      const children = allHeader.filter((c) => {
        if (!c.parent || c.parent.trim() === "" || c.parent === "None") return false;
        const cParent = c.parent.trim().toLowerCase();
        return cParent === pTitle || cParent === pId;
      });

      if (p.title === "Academics") {
        const sortedAcademics = [
          children.find((c) => c.title.toLowerCase().includes("curriculum")),
          children.find((c) => c.title.toLowerCase().includes("department")),
          children.find((c) => c.title.toLowerCase().includes("result")),
          ...children.filter(
            (c) =>
              !c.title.toLowerCase().includes("curriculum") &&
              !c.title.toLowerCase().includes("department") &&
              !c.title.toLowerCase().includes("result")
          ),
        ].filter(Boolean);

        for (let j = 0; j < sortedAcademics.length; j++) {
          if (sortedAcademics[j]) {
            await Menu.findByIdAndUpdate(sortedAcademics[j]!._id, { order: j + 1 });
          }
        }
      } else {
        children.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        for (let j = 0; j < children.length; j++) {
          await Menu.findByIdAndUpdate(children[j]!._id, { order: j + 1 });
        }
      }
    }

    // 2. Footer Quick Links
    const footerQuick = (await Menu.find({ location: "footer_quick", isDeleted: false })).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
    for (let i = 0; i < footerQuick.length; i++) {
      await Menu.findByIdAndUpdate(footerQuick[i]!._id, { order: i + 1 });
    }

    // 3. Footer Resources
    const footerRes = (await Menu.find({ location: "footer_resources", isDeleted: false })).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
    for (let i = 0; i < footerRes.length; i++) {
      await Menu.findByIdAndUpdate(footerRes[i]!._id, { order: i + 1 });
    }

    console.log("SUCCESS: All menus normalized successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error normalizing menus:", err);
    process.exit(1);
  }
}

run();
