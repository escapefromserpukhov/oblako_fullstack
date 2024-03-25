import { Form, Button, Panel, Whisper, Tooltip, InputGroup, Input } from "rsuite";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useActions } from "../../store";
import { AuthHeader } from "./auth-header";
import { useState } from "react";
import { About } from "../../components/about";
import EyeIcon from "@rsuite/icons/legacy/Eye";
import EyeSlashIcon from "@rsuite/icons/legacy/EyeSlash";

export const SignIn = () => {
  const [current, setCurrent] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const {
    dataFields: { email, password },
    errors,
    hasErrors,
    requestErrors,
  } = useSelector((state) => state.user);

  const { dispatch, actions } = useActions((actions) => actions.user);

  const submit = (
    <Button appearance="primary" disabled={hasErrors} onClick={() => dispatch(actions.onLogin({ email, password }))}>
      Войти
    </Button>
  );

  if (current === 1) {
    return (
      <>
        <AuthHeader title="Авторизация" current={current} setCurrent={setCurrent} />
        <About setCurrent={setCurrent} />
      </>
    );
  }

  return (
    <>
      <AuthHeader title="Авторизация" current={current} setCurrent={setCurrent} />
      <Panel bordered style={{ width: 400, overflow: "visible" }} header="Авторизация">
        <p style={{ marginBottom: 10 }}>
          <span className="text-muted">Не зарегистрированы?</span>{" "}
          <Link onClick={() => dispatch(actions.clearUserData())} to="/signup">
            Создать аккаунт
          </Link>
        </p>

        <Form fluid>
          <Form.Group>
            <Form.ControlLabel>
              <span>email</span>
            </Form.ControlLabel>
            <Form.Control
              name="email"
              value={email}
              onChange={(value) => dispatch(actions.setEmail(value))}
              errorMessage={errors.email}
              errorPlacement="rightEnd"
            />
          </Form.Group>

          <Form.Group>
            <Form.ControlLabel>
              <span>Пароль</span>
            </Form.ControlLabel>
            <InputGroup inside>
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="false"
                name="password"
                value={password}
                onChange={(value) => dispatch(actions.setPassword(value))}
              />
              <InputGroup.Button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
              </InputGroup.Button>
            </InputGroup>
            {/* <Form.Control
              autoComplete="false"
              name="password"
              type="password"
              value={password}
              onChange={(value) => dispatch(actions.setPassword(value))}
              errorPlacement="rightEnd"
            /> */}
          </Form.Group>
          <Form.Group>
            {hasErrors ? (
              <Whisper
                placement="right"
                controlId="control-id-hover"
                trigger="hover"
                speaker={<Tooltip>Введены некорректные данные.</Tooltip>}
              >
                {submit}
              </Whisper>
            ) : (
              submit
            )}
          </Form.Group>
          {Boolean(requestErrors.length) && (
            <span style={{ color: "red" }}>{requestErrors.map((item) => item?.message)}</span>
          )}
        </Form>
      </Panel>
    </>
  );
};
