<?php
function ehBissexto($ano) {
    return (($ano % 4 == 0 && $ano % 100 != 0) || ($ano % 400 == 0));
}

function pegarDiasPorMes($ano) {
    $diasPorMes = [];
    
    for ($mes = 1; $mes <= 12; $mes++) 
        $diasPorMes[$mes] = ($mes == 2) 
            ? (ehBissexto($ano) ? 29 : 28) 
            : (in_array($mes, [4, 6, 9, 11]) ? 30 : 31);
    
    return $diasPorMes;
}

function lerEntrada($prompt) {
    echo $prompt;
    return trim(fgets(STDIN));
}

$anosInput = lerEntrada("Digite os anos que deseja consultar (separados por vírgula): ");
$anos = array_map('trim', explode(',', $anosInput));
$anos = array_unique($anos);
sort($anos); 

$mostrarDiasPorMes = lerEntrada("Você quer ver a quantidade de dias por mês? (s/n): ");
$mostrarDiasPorMes = strtolower($mostrarDiasPorMes) === 's';

foreach ($anos as $ano) {
    if (!is_numeric($ano)) {
        echo "\n✕ Ano inválido: $ano";
        continue;
    }
    
    $ano = (int)$ano;
    
    echo "\n==================================================\n";
    echo "Ano: $ano\n";
    echo "==================================================\n";
    
    if ($mostrarDiasPorMes) {
        $dias = pegarDiasPorMes($ano);
        foreach ($dias as $mes => $diasNoMes) 
            echo "Mês $mes: $diasNoMes dias\n";
        echo "--------------------------------------------------\n";
    }
    
    $totalDias = array_sum(pegarDiasPorMes($ano));
    echo "Total de dias: $totalDias dias\n";
    echo "==================================================\n";
}
?>
