import { useState } from "react";
import { Popover, Whisper, Checkbox, Table, Toggle } from "rsuite";
import { useActions } from "../../store";
import { useSelector } from "react-redux";
import AdminIcon from "@rsuite/icons/Admin";
import { PropTypes } from "prop-types";

const { Cell } = Table;

export const NameCell = ({ rowData, dataKey, ...props }) => {
    const {
        data: { id: userId },
    } = useSelector((state) => state.user);

    return (
        <Cell {...props}>
            <span>{dataKey ? rowData[dataKey] : null}</span>
            {userId === rowData.id && (
                <Whisper placement="top" speaker={<Popover>Вы</Popover>}>
                    <AdminIcon color="violet" style={{ marginLeft: 6 }} />
                </Whisper>
            )}
        </Cell>
    );
};

NameCell.propTypes = {
    rowData: PropTypes.object,
    dataKey: PropTypes.string,
};

export const ImageCell = ({ rowData, ...props }) => (
    <Cell {...props} style={{ padding: 0 }}>
        <div
            style={{
                width: 40,
                height: 40,
                background: "#f5f5f5",
                borderRadius: "50%",
                marginTop: 2,
                overflow: "hidden",
                display: "inline-block",
            }}
        >
            <img loading="lazy" src={`https://i.pravatar.cc/${rowData?.id + 100}`} width="40" />
        </div>
    </Cell>
);

ImageCell.propTypes = {
    rowData: PropTypes.object,
};

export const CheckCell = ({ rowData, onChange, checkedKeys, dataKey, disabledId, ...props }) => (
    <Cell {...props} style={{ padding: 0 }}>
        <div style={{ lineHeight: "46px" }}>
            <Checkbox
                value={rowData[dataKey]}
                inline
                onChange={onChange}
                checked={checkedKeys.some((item) => item === rowData[dataKey])}
                disabled={disabledId === rowData.id}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    </Cell>
);

CheckCell.propTypes = {
    rowData: PropTypes.object,
    onChange: PropTypes.func,
    checkedKeys: PropTypes.array,
    dataKey: PropTypes.string,
    disabledId: PropTypes.any,
};

export const AdminCell = ({ rowData, dataKey, currentUser, ...props }) => {
    const [loading, setLoading] = useState(false);
    const { dispatch, actions } = useActions();
    return (
        <Cell {...props} onClick={(e) => e.stopPropagation()}>
            <Toggle
                loading={loading}
                disabled={currentUser.id === rowData.id}
                checked={rowData[dataKey] === "admin"}
                size="md"
                checkedChildren="Admin"
                unCheckedChildren="User"
                onChange={async () => {
                    setLoading(true);
                    await dispatch(
                        actions.main.onUpdateUser({
                            userId: rowData.id,
                            data: { role: rowData.role === "admin" ? "user" : "admin" },
                        })
                    );
                    setLoading(false);
                }}
            />
        </Cell>
    );
};

AdminCell.propTypes = {
    rowData: PropTypes.object,
    dataKey: PropTypes.string,
    currentUser: PropTypes.object,
};
