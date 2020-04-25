import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map((alert) => (
    <div key="alert.id" className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  alerts: state.alert,
});

export default connect(mapStateToProps)(Alert);

//1-Conectamos el componente con la store usando connect()(Alert)
//2- Mapeamos el state a las props, usando mapStateToProps, nos traemos las alerts: haciendo state.alert
//3-Ahora podemos usarlas como props.
//4-Usamos map para generar dinamicamente los errores
//5-devolvemos el mensaje de alerta, usamos className con `` porque es dinamico, es decir el segundo alert va a tomar el alertType (danger,warning...) y va a aplicar
//el estilo que tenemos en App.css
