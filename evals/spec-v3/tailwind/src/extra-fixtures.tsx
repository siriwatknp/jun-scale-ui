import { Badge, Button, Checkbox, Icon } from "./components";
import type { Fixture } from "./kit/fixtures";
import { bookmark } from "./kit/icons";

export const extraFixtures: Fixture[] = [
  { name: "ButtonScaledViaUtility", group: 5, render: () => <Button className="ui-scale-group5-[1.2]"><Icon>{bookmark}</Icon>Save</Button> },
  { name: "ButtonWithBadgeViaUtility", group: 5, render: () => <Button className="ui-scale-group3-0.5">Inbox<Badge>12</Badge></Button> },
  { name: "CheckboxOverrideViaUtility", group: 3, render: () => <Checkbox defaultChecked aria-label="Agree" className="ui-scale-group2-1" /> },
];
