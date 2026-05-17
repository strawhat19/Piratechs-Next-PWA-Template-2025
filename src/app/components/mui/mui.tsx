import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const darkTheme = createTheme({ palette: { mode: `dark`, } });

export default function MUI({ children }: any) {
    return (
        <div>
            {/* <ThemeProvider theme={darkTheme}> */}
                {/* <CssBaseline /> */}
                {children}
            {/* </ThemeProvider> */}
        </div>
    )
}