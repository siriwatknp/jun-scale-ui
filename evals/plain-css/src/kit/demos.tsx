import type { ReactNode } from "react";
import { Avatar, Badge, Button, Callout, Field, Icon, Input, Kbd, Select, Spinner, StatusDot } from "../components";
import { cssVariables } from "./fixtures";
import { bookmark, info, search } from "./icons";

export const demos: { name: string; render: () => ReactNode }[] = [
  { name: "Button with Kbd", render: () => <Button>Search<Kbd>K</Kbd></Button> },
  { name: "Input with Icon and Spinner", render: () => <Input start={<Icon>{search}</Icon>} end={<Spinner />} placeholder="Loading" /> },
  { name: "Select with StatusDot", render: () => <Select><StatusDot />Online</Select> },
  {
    name: "Select open",
    render: () => (
      <Select open items={[<><Avatar>AK</Avatar>Alex Kim</>, <><Avatar>JS</Avatar>Jo Smith</>]}>
        <Avatar>AK</Avatar>Alex Kim
      </Select>
    ),
  },
  {
    name: "Field with Badge and error",
    render: () => (
      <Field label={<>Email<Badge>Required</Badge></>} error="Enter a valid email address." invalid>
        <Input placeholder="you@example.com" />
      </Field>
    ),
  },
  { name: "Callout, two lines", render: () => <Callout icon={<Icon>{info}</Icon>}>Your trial ends in three days. Add a card to keep your projects.</Callout> },
  { name: "Button at --scale-group5: 0.75", render: () => <Button style={cssVariables({ "--scale-group5": 0.75 })}><Icon>{bookmark}</Icon>Save</Button> },
];
