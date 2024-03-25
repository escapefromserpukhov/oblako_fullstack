import { Form, Button, Panel, Tooltip, Whisper, InputGroup } from "rsuite";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useActions } from "../../store";
import { useState } from "react";
import { AuthHeader } from "./auth-header";
import { About } from "../../components/about";
import EyeIcon from "@rsuite/icons/legacy/Eye";
import EyeSlashIcon from "@rsuite/icons/legacy/EyeSlash";

export const SignUp = () => {
  const [current, setCurrent] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const {
    dataFields: { username, password, email },
    errors,
    hasErrors,
    requestErrors,
  } = useSelector((state) => state.user);

  const { dispatch, actions } = useActions((actions) => actions.user);

  const submit = (
    <Button
      appearance="primary"
      disabled={hasErrors}
      onClick={() => dispatch(actions.onRegister({ username, password, email }))}
    >
      Зарегистрироваться
    </Button>
  );

  if (current === 1) {
    return (
      <>
        <AuthHeader title="Регистрация" current={current} setCurrent={setCurrent} />
        <About setCurrent={setCurrent} />
      </>
    );
  }

  return (
    <>
      <AuthHeader title="Регистрация" current={current} setCurrent={setCurrent} />
      <Panel bordered style={{ width: 400, overflow: "visible" }} header="Регистрация">
        <p style={{ marginBottom: 10 }}>
          <span className="text-muted">Зарегистрированы?</span>{" "}
          <Link onClick={() => dispatch(actions.clearUserData())} to="/signin">
            Войти
          </Link>
        </p>

        <Form fluid>
          <Form.Group>
            <Form.ControlLabel>Имя</Form.ControlLabel>
            <Form.Control
              name="name"
              value={username}
              onChange={(value) => dispatch(actions.setUsername(value))}
              errorMessage={errors.username}
              errorPlacement="leftStart"
            />
          </Form.Group>
          <Form.Group>
            <Form.ControlLabel>
              <span>email</span>
            </Form.ControlLabel>
            <Form.Control
              name="email"
              value={email}
              type="email"
              onChange={(value) => dispatch(actions.setEmail(value))}
              errorMessage={errors.email}
              errorPlacement="leftStart"
            />
          </Form.Group>
          <Form.Group>
            <Form.ControlLabel>
              <span>Пароль</span>
            </Form.ControlLabel>
            <InputGroup inside>
              <Form.Control
                autoComplete="false"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(value) => dispatch(actions.setPassword(value))}
                errorMessage={errors.password}
                errorPlacement="leftStart"
              />
              <InputGroup.Addon onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
              </InputGroup.Addon>
            </InputGroup>
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
