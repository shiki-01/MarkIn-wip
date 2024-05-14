import * as React from "react";
import {
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    InlineDrawer,
    makeStyles,
    Button,
    DrawerProps,
    Avatar,
} from "@fluentui/react-components";
import ChevronRight from '@mui/icons-material/ChevronRight';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import Person from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';

const useStyles = makeStyles({
    root: {
        display: "flex",
        height: "calc(100vh - 40px)",
    },
});

type DrawerSeparatorExampleProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    position: DrawerProps["position"];
    className?: string;
};

const DrawerSeparatorExample: React.FC<DrawerSeparatorExampleProps> = ({
    open,
    setOpen,
    position,
}) => {
    return (
        <InlineDrawer separator position={position} open={open}>
            <DrawerHeader>
                <DrawerHeaderTitle
                    action={
                        <Button
                            appearance="subtle"
                            aria-label="Close"
                            icon={<ChevronLeft />}
                            onClick={() => setOpen(false)}
                        />
                    }
                >
                    MenuBar
                </DrawerHeaderTitle>
            </DrawerHeader>

            <DrawerBody>
                <div className="person">
                    <Avatar icon={<Person />} aria-label="Guest" />
                    <p>Guest</p>
                    <span className="setting">
                        <Button icon={<Settings />} />
                    </span>
                </div>
            </DrawerBody>
        </InlineDrawer>
    );
};

const Header = () => {
    const styles = useStyles();

    const [leftOpen, setLeftOpen] = React.useState(true);

    return (
        <div className={`${leftOpen ? "toggle-wrap open" : "toggle-wrap"} ${styles.root}`} style={{ borderBottomWidth: 0 }}>
            <DrawerSeparatorExample
                open={leftOpen}
                setOpen={setLeftOpen}
                position="start"
            />
            <div className={leftOpen ? "toggle-opener open" : "toggle-opener"}>
                <Button icon={<ChevronRight />} appearance="subtle" size="large" onClick={() => setLeftOpen(!leftOpen)} />
            </div>
        </div>
    );
};

export default Header;