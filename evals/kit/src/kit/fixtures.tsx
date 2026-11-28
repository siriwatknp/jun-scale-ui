import type { CSSProperties, ReactNode } from "react";
import { Avatar, Badge, Button, Callout, Card, Checkbox, Dialog, Field, Icon, IconButton, Input, Kbd, Popover, Select, Spinner, StatusDot, Switch } from "../components";
import { extraFixtures } from "../extra-fixtures";
import { bookmark, close, info, plus, search, star } from "./icons";

export type Fixture = { name: string; group: number; render: () => ReactNode };

export const cssVariables = (values: Record<string, number>) => values as CSSProperties;

export const fixtures: Fixture[] = [
  { name: "StatusDot", group: 1, render: () => <StatusDot /> },
  { name: "Icon", group: 2, render: () => <Icon>{star}</Icon> },
  { name: "Spinner", group: 2, render: () => <Spinner /> },
  { name: "Badge", group: 3, render: () => <Badge>New</Badge> },
  { name: "Kbd", group: 3, render: () => <Kbd>K</Kbd> },
  { name: "Checkbox", group: 3, render: () => <Checkbox defaultChecked aria-label="Agree" /> },
  { name: "Switch", group: 3, render: () => <Switch aria-label="Sync" /> },
  { name: "Avatar", group: 4, render: () => <Avatar>AK</Avatar> },
  { name: "Button", group: 5, render: () => <Button><Icon>{bookmark}</Icon>Save</Button> },
  { name: "IconButton", group: 5, render: () => <IconButton aria-label="Add"><Icon>{plus}</Icon></IconButton> },
  { name: "Input", group: 5, render: () => <Input start={<Icon>{search}</Icon>} placeholder="Search" /> },
  { name: "Select", group: 5, render: () => <Select><Avatar>AK</Avatar>Alex Kim</Select> },
  { name: "Field", group: 5, render: () => <Field label="Email" help="We reply within a day."><Input placeholder="you@example.com" /></Field> },
  { name: "FieldLabelBadge", group: 5, render: () => <Field label={<>Email<Badge>Required</Badge></>}><Input placeholder="you@example.com" /></Field> },
  { name: "Callout", group: 6, render: () => <Callout icon={<Icon>{info}</Icon>}>You need admin access to install this app.</Callout> },
  { name: "BadgeIcon", group: 3, render: () => <Badge><Icon>{star}</Icon>New</Badge> },
  { name: "ButtonIconHalf", group: 5, render: () => <Button style={cssVariables({ "--scale-group2": 0.5 })}><Icon>{bookmark}</Icon>Save</Button> },
  { name: "InputAction", group: 5, render: () => <Input placeholder="Search" action={<Icon>{close}</Icon>} actionLabel="Clear" /> },
  { name: "SelectOpen", group: 5, render: () => <Select open items={[<><Avatar>AK</Avatar>Alex Kim</>, "Jo Smith"]}><Avatar>AK</Avatar>Alex Kim</Select> },
  { name: "Card", group: 7, render: () => <Card><Badge>New</Badge>Your trial ends in three days.</Card> },
  {
    name: "Dialog",
    group: 7,
    render: () => (
      <Dialog title="Invite people" description="They get an email with a link." actions={<><Button>Cancel</Button><Button><Icon>{plus}</Icon>Invite</Button></>}>
        <Field label="Email"><Input placeholder="you@example.com" /></Field>
      </Dialog>
    ),
  },
  { name: "Popover", group: 7, render: () => <Popover open trigger={<Button>Share</Button>}>Anyone with the link can view.<Button>Copy link</Button></Popover> },
  { name: "CheckboxOverride", group: 3, render: () => <Checkbox defaultChecked aria-label="Agree" style={cssVariables({ "--scale-group2": 1 })} /> },
  { name: "ButtonScaled", group: 5, render: () => <Button style={cssVariables({ "--scale-group5": 1.2 })}><Icon>{bookmark}</Icon>Save</Button> },
  { name: "ButtonWithBadge", group: 5, render: () => <Button style={cssVariables({ "--scale-group3": 0.5 })}>Inbox<Badge>12</Badge></Button> },
  ...extraFixtures,
];
