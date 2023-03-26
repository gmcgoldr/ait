import { AppBar, Container, Toolbar, Typography } from "@mui/material";

export function AppTitle() {
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Container maxWidth="md">
            <Typography variant="h6" sx={{ my: 2 }}>
              AIT
            </Typography>
          </Container>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
}
