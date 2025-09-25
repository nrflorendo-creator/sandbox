SELECT
    series.id,
    SUBSTR(
        BUILTIN.DF(series.custrecord_itg_csppm_accountlink),
        1,
        INSTR(
            BUILTIN.DF(series.custrecord_itg_csppm_accountlink),
            ' '
        ) - 1
    ) AS bank,
    BUILTIN.DF(series.custrecord_itg_csppm_paymentmethod) AS method,
    BUILTIN.DF(series.custrecord_itg_csppm_user) AS user,
    series.custrecord_itg_csppm_nextcheckseries AS current,
    series.custrecord_itg_csppm_minimumseries AS minimum,
    series.custrecord_itg_csppm_maximumseries AS maximum
FROM
    CUSTOMRECORD_ITG_CHECKSERIESPERPAYMETHOD series
WHERE
    series.custrecord_itg_csppm_accountlink = ?
    AND series.custrecord_itg_csppm_paymentmethod = ?