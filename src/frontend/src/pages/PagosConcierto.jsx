import {
  AbsoluteCenter,
  Box,
  Button,
  Heading,
  Spinner,
  Wrap,
  WrapItem, useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import FiltrosPagos from '../components/FiltrosPagos';
import Pago from '../components/Pago';
import api from "../services/api";
import { endpoints } from "../services/endpoints";

export default function Pagos() {
  const location = useLocation()
  const id_concierto = location.state;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPagos = async (filtros) => {
    setLoading(true);

    const params = {concierto: id_concierto}

    if (filtros?.fechaDesde) params.fecha_desde = filtros.fechaDesde;
    if (filtros?.fechaHasta) params.fecha_hasta = filtros.fechaHasta;
    if (filtros?.montoMin > 0) params.monto_min = filtros.montoMin;
    if (filtros?.montoMax > 0) params.monto_max = filtros.montoMax;

    try {
      const response = await api.get(
        endpoints.pagos.pagos,
        { params }
      );

      setPagos(response.data.results);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPagos();
  }, []);

  return (
    <Box p={5} align='center'>
      <Heading mb={6} align='center' color='gray.50' size='2xl'>Ventas</Heading>
      <Button
        bg='whiteAlpha.800'
        color='blackAlpha.800'
        rounded='full'
        onClick={onOpen}
        mb={6}
      >
        Filtros
      </Button>
      <Wrap spacing={10} align='center' justify='center'>
        {!loading ? (
          pagos.length > 0 ? (
            pagos.map((p) => (
              <WrapItem align='center' key={p.id}>
                <Pago {...p}/>
              </WrapItem>
            ))
          ) : (
            <AbsoluteCenter>
              <Box bg='whiteAlpha.500' p={4} borderRadius={8} color='white'>
                <Heading align='center'>No hay ventas realizadas</Heading>
              </Box>
            </AbsoluteCenter>
          )
        ) : (
          <Spinner size='xl' color='white' />
        )}
      </Wrap>

      <FiltrosPagos
        isOpen={isOpen}
        onClose={onClose}
        onApply={fetchPagos}
      />
    </Box>
  )
}
