/** Catalog-supported customisation capabilities only. */
export const customCapabilities = [
  {
    key: "folders",
    title: "Custom folder size & quantity",
    text: "Acrylic Folder Display Boards are made with folder size and quantity as per customer requirement — for charts, reports, SOPs and production data.",
    product: "acrylic-folder-display-board",
  },
  {
    key: "fabric",
    title: "Custom fabric colour & layout",
    text: "Fabric Notice Boards are available in the customer's preferred fabric colour, with board layout provided as per customer requirement.",
    product: "fabric-notice-board",
  },
  {
    key: "combination",
    title: "Combination boards",
    text: "Dry wipe white board on one side and fabric notice board on the other — writing and pin-up display in a single board, in Metallic Premium, Eco Premium and Deluxe frame variants.",
    product: "combination-board",
  },
  {
    key: "practice",
    title: "Practice board line layouts",
    text: "Four Line & Square Line Practice Boards with line marking provided as per school / customer requirements.",
    product: "four-line-square-line-practice-board",
  },
  {
    key: "schedule",
    title: "Schedule board designs",
    text: "Dry Wipe Schedule Boards are available in any design and any size, made to your sketch.",
    product: "dry-wipe-schedule-board",
  },
  {
    key: "frames",
    title: "Frame variants",
    text: "Cork, fabric and combination boards are available in Metallic Premium, Eco Premium and Deluxe frame variants.",
    product: "cork-notice-board",
  },
] as const;

export const scheduleBoardRequirements = {
  intro: "Available in any design / any size. The following details need to be provided before ordering:",
  items: ["Quantity of board", "Sizes of board", "Sketch of board as per customer requirements"],
  formats: ["CorelDRAW", "Photoshop", "Word"],
  note: "When Plusmark makes the design of a board, additional charges will be applicable.",
};
