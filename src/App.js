import React, { useState } from "react";
import { productos } from "./data";
import "./App.css";

function formatoCOP(valor) {
  return "$ " + Math.round(valor).toLocaleString("es-CO");
}

export default function App() {
  const [categoria, setCategoria] = useState("Todos");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cuotaInicial, setCuotaInicial] = useState(0);
  const [plazo, setPlazo] = useState(12);

  const categorias = ["Todos", ...new Set(productos.map(p => p.categoria))];

  const lista =
    categoria === "Todos"
      ? productos
      : productos.filter(p => p.categoria === categoria);

  const montoFinanciado =
    productoSeleccionado
      ? productoSeleccionado.precio - cuotaInicial
      : 0;

  let cuota = 0;
  let tasaMV = 0;
  let tasaEA = 0;

  if (productoSeleccionado) {
    const monto = montoFinanciado;
    const tasa = productoSeleccionado.tasa;

    tasaMV = tasa;
    tasaEA = Math.pow(1 + tasa, 12) - 1;

    cuota = (monto * tasa) / (1 - Math.pow(1 + tasa, -plazo));
  }

  // seguro todo riesgo dinámico
  let tasaSeguroTodoRiesgo = 0;
  if (productoSeleccionado) {
    tasaSeguroTodoRiesgo =
      productoSeleccionado.precio <= 25000000 ? 0.0741 : 0.1264;
  }

  const seguroTodoRiesgo =
    productoSeleccionado
      ? ((productoSeleccionado.precio * tasaSeguroTodoRiesgo) * 1.19) / 12
      : 0;

  const seguroVida =
    productoSeleccionado
      ? (((montoFinanciado) * 0.015127695800227) * 1.19) / 12
      : 0;

  const cuotaTotal = cuota + seguroVida + seguroTodoRiesgo;

  const errorInicial =
    productoSeleccionado &&
    cuotaInicial > productoSeleccionado.precio;

  // ✅ TABLA AMORTIZACIÓN (CORRECTA)
  let tablaAmortizacion = [];

  if (productoSeleccionado && montoFinanciado > 0) {
    let saldo = montoFinanciado;

    for (let i = 1; i <= plazo; i++) {
      const interes = saldo * tasaMV;
      const capital = cuota - interes;
      const saldoFinal = saldo - capital;

      tablaAmortizacion.push({
        mes: i,
        saldoInicial: saldo,
        interes,
        capital,
        cuota,
        seguroVida,
        seguroTodoRiesgo,
        cuotaTotal,
        saldoFinal: saldoFinal > 0 ? saldoFinal : 0
      });

      saldo = saldoFinal;
    }
  }

  return (
    <div className="container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>Productos</h2>

        <select className="select" onChange={(e) => setCategoria(e.target.value)}>
          {categorias.map(c => <option key={c}>{c}</option>)}
        </select>

        {lista.map((p, i) => (
          <div
            key={i}
            className={`card ${productoSeleccionado?.producto === p.producto ? "selected" : ""}`}
            onClick={() => {
              setProductoSeleccionado(p);
              setPlazo(p.plazo_maximo);
              setCuotaInicial(0);
            }}
          >
            <img src={p.imagen} alt="" />
            <h4>{p.producto}</h4>
            <p>{formatoCOP(p.precio)}</p>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="main">

        {/* HEADER */}
        <div className="header">
          <div className="header">
  <div className="header-content">

    {/* IZQUIERDA */}
    <h2 className="titulo">
      SIMULADOR FINANCIACIÓN (DEMO)
    </h2>

    {/* DERECHA */}
    <div className="logos">
      
      <img src="/yamaha.png" alt="yamaha" />

      <div className="divider"></div>

      <img src="/eduardono.png" alt="eduardono" className="eduardo" />

    </div>

  </div>
</div>
        </div>

        {!productoSeleccionado && <h2>Selecciona un producto</h2>}

        {productoSeleccionado && (
          <>
            {/* SIMULADOR */}
            <div className="simulador">

              <h2>{productoSeleccionado.producto}</h2>

              <div className="simulador-content">

                <div className="imagen">
                  <img src={productoSeleccionado.imagen} width="200" alt="" />
                </div>

                <div className="info">

                  <div className="precio">
                    Precio {formatoCOP(productoSeleccionado.precio)}
                  </div>

                  Cuota Inicial <input
                    type="text"
                    value={(cuotaInicial || 0).toLocaleString("es-CO")}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
                      setCuotaInicial(Number(valor));
                    }}
                  />

                  {cuotaInicial > 0 && (
                    <div className="financiado">
                      Valor financiado: {formatoCOP(montoFinanciado)}
                    </div>
                  )}

                  <label>Plazo: {plazo} meses</label>

                  <input
                    type="range"
                    min="6"
                    max={productoSeleccionado.plazo_maximo}
                    value={plazo}
                    onChange={(e) => setPlazo(Number(e.target.value))}
                  />

                  <div className="tasas">
                    <div className="tasa-box">MV: {(tasaMV * 100).toFixed(2)}%</div>
                    <div className="tasa-box">EA: {(tasaEA * 100).toFixed(2)}%</div>
                  </div>

                  <div className="cuota">
                    Cuota Mensual {formatoCOP(cuota)}
                  </div>

                  <div>Seguro de Vida {formatoCOP(seguroVida)}</div>
                  <div>
                    Seguro Todo Riesgo {formatoCOP(seguroTodoRiesgo)} (Tasa {(tasaSeguroTodoRiesgo * 100).toFixed(2)}%)
                  </div>

                  <div className="cuota-total">
                    Cuota Mensual Total {formatoCOP(cuotaTotal)}
                  </div>

                </div>
              </div>
            </div>

            {/* ✅ TABLA */}
            {tablaAmortizacion.length > 0 && (
              <div className="tabla">
                <h3>Tabla de amortización</h3>

                <table>
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Saldo Inicial</th>
                      <th>Capital</th>
                      <th>Interés</th>
                      <th>Cuota sin Seguros</th>
                      <th>Seguro de Vida</th>
                      <th>Todo Riesgo</th>
                      <th>Cuota Total</th>
                      <th>Saldo Final</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tablaAmortizacion.map(row => (
                      <tr key={row.mes}>
                        <td>{row.mes}</td>
                        <td>{formatoCOP(row.saldoInicial)}</td>
                        <td>{formatoCOP(row.capital)}</td>
                        <td>{formatoCOP(row.interes)}</td>
                        <td>{formatoCOP(row.cuota)}</td>
                        <td>{formatoCOP(row.seguroVida)}</td>
                        <td>{formatoCOP(row.seguroTodoRiesgo)}</td>
                        <td>{formatoCOP(row.cuotaTotal)}</td>
                        <td>{formatoCOP(row.saldoFinal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
