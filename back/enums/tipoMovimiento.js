const tipoMovimiento = {
    TERCEROS: 'T',
    PROPIA: 'P',
    DEPOSITO: 'D',
    RETIRO: 'R'
};

const tipoTransferencia = {
    ENTRANTE: 'E',
    SALIENTE: 'S'
};

const tipoDeposito = {
    EFECTIVO: 'E',
    CHEQUE: 'C'
}

module.exports = {
    tipoMovimiento,
    tipoTransferencia,
    tipoDeposito
}