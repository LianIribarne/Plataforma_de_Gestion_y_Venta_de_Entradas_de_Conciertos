import {
  Heading, HStack, Wrap, WrapItem,
  Text, Box, Checkbox, Button,
  AbsoluteCenter, Link, Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import { ExternalLinkIcon, ViewOffIcon, ViewIcon } from '@chakra-ui/icons';
import Entrada from '../components/Entrada'
import api from "../services/api";

export default function Entradas() {
  const [selected, setSelected] = useState({});

  const toggleEntrada = (codigo) =>
    setSelected((s) => ({ ...s, [codigo]: !s[codigo] }));

  const toggleEvento = (ev) => {
    const next = { ...selected };
    const codes = ev.entradas.map((x) => x.codigo);
    const allSelected = codes.every((c) => next[c]);
    codes.forEach((c) => (next[c] = !allSelected));
    setSelected(next);
  };

  const [eventoAImprimir, setEventoAImprimir] = useState(null);

  const imprimirEvento = (eventoId) => {
    setEventoAImprimir(eventoId);
    setTimeout(() => window.print(), 0);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      setEventoAImprimir(null);
    };

    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const [verEntradas, setVerEntradas] = useState({});

  const toggleVerEntradas = (eventoId) => {
    setVerEntradas((s) => ({
      ...s,
      [eventoId]: !s[eventoId],
    }));
  };

  const [entradas, setEntradas] = useState([])
  const [loading, setLoading] = useState(true)
  
  const fetchEntradas = async () => {
    setLoading(true);

    try {
      const response = await api.get(
        "/entradas/entradas/"
      );

      setEntradas(response.data)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntradas();
  }, []);

  return entradas ? (
    <Box py={5}>
      <Heading 
        align='center' 
        fontSize='5xl' 
        color='white' 
      >
        Tus Entradas
      </Heading>
      
      {entradas.map((ev) => {
        const allChecked = ev.entradas.every((x) => selected[x.codigo]);
        const visibles = verEntradas[ev.concierto.titulo] ?? true;

        return (
          <Box key={ev.concierto.titulo} mt={5}>
            <HStack>
              <Heading ml={4} color='white'>{ev.concierto.titulo}</Heading>
              <Button
                onClick={() => imprimirEvento(ev.concierto.titulo)}
                size='md'
                rounded='full'
                mt={3}
                isDisabled={
                  !ev.entradas.some((x) => selected[x.codigo])
                }
              >
                Imprimir
              </Button>
              <Tooltip label={visibles  ? 'Ocultar' : 'Mostrar'} placement='top'>
                <IconButton  
                  bg='whiteAlpha.800'
                  color='blackAlpha.800'
                  rounded='full' 
                  ml={2}
                  mb={-3}
                  onClick={() => toggleVerEntradas(ev.concierto.titulo)}
                  icon={visibles ? <ViewOffIcon /> : <ViewIcon />}
                />
              </Tooltip>
            </HStack>

            {/* checkbox general del evento */}
            <Box>
              <Checkbox
                isChecked={allChecked}
                onChange={() => toggleEvento(ev)}
                mt={2}
                ml={4}
                size='lg'
                colorScheme="whiteAlpha"
                color='white'
                display={ev.concierto.estado === 'Cancelado' || !visibles ? 'none' : 'inline-block' }
              />
              
              <Text 
                mt={1}
                ml={2}
                color='white'
                fontSize='lg'
                display={ev.concierto.estado === 'Cancelado' || !visibles ? 'none' : 'inline-block' }
              >
                <b>Seleccionar todas</b>
              </Text>
            </Box>

            <Wrap spacing={6} justify='center' align='center' mt={4} display={visibles ? undefined : 'none'}>
              {ev.entradas.map((x) => (
                <WrapItem key={x.codigo}>
                  <Box>
                    <Entrada
                      qr={x.qr_url}
                      artista={ev.concierto.artista}
                      titulo={ev.concierto.titulo}
                      fecha={ev.concierto.fecha}
                      puertas={ev.concierto.puertas_hora}
                      show={ev.concierto.show_hora}
                      precio={x.precio}
                      codigo={x.codigo}
                      tipo={x.tipo}
                      estado={ev.concierto.estado}
                    />

                    <HStack>
                      <Checkbox
                        isChecked={!!selected[x.codigo]}
                        onChange={() => toggleEntrada(x.codigo)}
                        size='lg'
                        colorScheme="whiteAlpha"
                        mt={2}
                        color='white'
                        display={ev.concierto.estado === 'Cancelado' ? 'none' : 'inline-block' }
                      />
                      
                      <Text 
                        mt={1}
                        color='white'
                        fontSize='lg'
                        display={ev.concierto.estado === 'Cancelado' ? 'none' : 'inline-block' }
                      >
                        <b>Seleccionar</b>
                      </Text>
                    </HStack>
                  </Box>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        );
      })}

      <div id="entrada-print">
        {entradas
          .filter((ev) => ev.concierto.titulo === eventoAImprimir)
          .flatMap((ev) =>
            ev.entradas
              .filter((x) => selected[x.codigo])
              .map((x) => 
              <Entrada 
                key={x.codigo}
                qr={x.qr_url}
                artista={ev.concierto.artista}
                titulo={ev.concierto.titulo}
                fecha={ev.concierto.fecha}
                puertas={ev.concierto.puertas_hora}
                show={ev.concierto.show_hora}
                precio={x.precio}
                codigo={x.codigo}
                tipo={x.tipo}
                estado={ev.concierto.estado} 
              />)
          )}
      </div>
    </Box>
  ) : (
    <AbsoluteCenter>
      <Box bg='whiteAlpha.500' p={4} borderRadius={8} color='white'>
        <Heading align='center'>No hay entradas adquiridas</Heading>
        <Text align='center'>
          <b>
            Para adquirir entradas, vaya a la seccion de{' '}
            <Link href='http://localhost:5173/conciertos'>
              Eventos <ExternalLinkIcon mx='2px' mb={1} />
            </Link>
          </b>
        </Text>
      </Box>
    </AbsoluteCenter>
  )
}
