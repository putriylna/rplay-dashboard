import { group } from "console";
import { Elysia, t } from "elysia";

export const wilayahRoutes = new Elysia()
  .group("/admin", (admin) =>
    admin
      .post("/login", () => ({ success: true }), {
        body: t.Object({
          email: t.String(),
          password: t.String(),
        }),
      })
      .post("/register", () => ({ success: true }), {
        body: t.Object({
          full_name: t.String(),
          email: t.String(),
          password: t.String(),
          photo_url: t.Optional(t.String()),
        }),
      })
      .post("/scan-ticket", () => ({ success: true }), {
        body: t.Object({
          qr_content: t.String(),
        }),
      })
      .get("/list", () => []),
  )
  .group("/cities", (cities) =>
    cities
      .get("/", () => [])
      .post("/", () => ({ success: true }))
      .delete(
        "/:id",
        ({ params }) => {
          console.log("Delete City ID:", params.id);
          return { success: true };
        },
        {
          params: t.Object({ id: t.Numeric() }),
        },
      ),
  )
  .group("/cinemas", (cinemas) =>
    cinemas
      .get("/", () => [])
      .post("/", () => ({ success: true }), {
        body: t.Object({
          city_id: t.Number(),
          nama_bioskop: t.String(),
          alamat: t.String(),
          map_url: t.Optional(t.String()),
        }),
      })
      .put(
        "/:id",
        ({ params, body }) => {
          console.log("Update Cinema ID:", params.id);
          return { success: true, data: body };
        },
        {
          params: t.Object({ id: t.Numeric() }),
          body: t.Object({
            city_id: t.Number(),
            nama_bioskop: t.String(),
            alamat: t.String(),
            map_url: t.Optional(t.String()),
          }),
        },
      )
      .delete(
        "/:id",
        ({ params }) => {
          console.log("Delete Cinema ID:", params.id);
          return { success: true };
        },
        {
          params: t.Object({ id: t.Numeric() }),
        },
      ),
  )
  .group("/studios", (studios) =>
    studios
      .get("/", () => [])
      .post("/", () => ({ success: true }), {
        body: t.Object({
          cinema_id: t.Number(),
          nama_studio: t.String(),
          type: t.String(), // Reguler, IMAX, Premiere
        }),
      }),
  )
  .group("/studios", (studios) =>
    studios
      .get("/", () => []) // List semua studio
      .post("/", () => ({ success: true }), {
        body: t.Object({
          cinema_id: t.Number(),
          nama_studio: t.String(),
          type: t.String(), // Reguler, IMAX, Premiere
        }),
      })
      .put("/:id", ({ params, body }) => ({ success: true, data: body }), {
        params: t.Object({ id: t.Numeric() }),
        body: t.Object({
          cinema_id: t.Number(),
          nama_studio: t.String(),
          type: t.String(),
        }),
      })
      .delete("/:id", ({ params }) => ({ success: true }), {
        params: t.Object({ id: t.Numeric() }),
      })
      .group("/seats", (seats) =>
        seats
          .post(
            "/generate",
            ({ body }) => {
              console.log("Generating seats for studio:", body.studio_id);
              return {
                success: true,
                message: `Berhasil membuat ${body.row_count * body.seats_per_row} kursi`,
              };
            },
            {
              body: t.Object({
                studio_id: t.Number(),
                row_count: t.Number(),
                seats_per_row: t.Number(),
              }),
            },
          )
          .get(
            "/status/:schedule_id",
            ({ params }) => {
              return {
                schedule_id: params.schedule_id,
                seats: [],
              };
            },
            {
              params: t.Object({ schedule_id: t.Numeric() }),
            },
          ),
      ),
  )

  .group("/movies", (movies) =>
    movies
      .get("/", () => []) // List semua film
      .post("/", ({ body }) => ({ success: true, data: body }), {
        body: t.Object({
          title: t.String(),
          slug: t.String(),
          synopsis: t.String(),
          duration: t.Number(),
          genre: t.String(),
          rating_age: t.String(),
          photo_url: t.Optional(t.String()),
          trailer_url: t.Optional(t.String()),
          is_playing: t.Boolean(),
        }),
      })
      .put("/:id", ({ params, body }) => ({ success: true, data: body }), {
        params: t.Object({ id: t.Numeric() }),
        body: t.Object({
          title: t.String(),
          slug: t.String(),
          synopsis: t.String(),
          duration: t.Number(),
          genre: t.String(),
          rating_age: t.String(),
          photo_url: t.Optional(t.String()),
          trailer_url: t.Optional(t.String()),
          is_playing: t.Boolean(),
        }),
      })
      .delete("/:id", ({ params }) => ({ success: true }), {
        params: t.Object({ id: t.Numeric() }),
      }),
  )
  .group("/actors", (actors) =>
    actors
      .get("/", () => []) // List semua aktor untuk dropdown
      .post("/", ({ body }) => ({ success: true, data: body }), {
        body: t.Object({
          actor_name: t.String(),
          photo_url: t.Optional(t.String()),
        }),
      }),
  )
  .group("/casts", (casts) =>
    casts
      .get("/movie/:movieId", ({ params }) => [], {
        params: t.Object({
          movie_id: t.Numeric(),
        }),
      })
      .post("/", ({ body }) => ({ success: true, data: body }), {
        body: t.Object({
          movie_id: t.Number(),
          actor_id: t.Number(),
          character_name: t.String(),
          photo_url: t.Optional(t.String()),
        }),
      })
      .delete("/:id", ({ params }) => ({ success: true }), {
        params: t.Object({
          id: t.Numeric(),
        }),
      }),
  )
  // --- SCHEDULES (TAMBAHAN BARU) ---
  .group("/schedules", (schedules) =>
    schedules
      // List semua jadwal (biasanya untuk admin)
      .get("/", () => [])
      
      // Filter jadwal (biasanya untuk user/customer)
      .get("/filter", ({ query }) => [], {
        query: t.Object({
          movie_id: t.Optional(t.Numeric()),
          city_id: t.Optional(t.Numeric()),
        })
      })

      // Ambil detail satu jadwal
      .get("/:id", ({ params }) => ({ id: params.id }), {
        params: t.Object({ id: t.Numeric() })
      })

      // Tambah jadwal baru
      .post("/", ({ body }) => ({ success: true, data: body }), {
        body: t.Object({
          movie_id: t.Number(),
          studio_id: t.Number(),
          show_date: t.String(), // YYYY-MM-DD
          show_time: t.String(), // HH:mm
          price: t.Number(),
        }),
      })

      // Update jadwal
      .put("/:id", ({ params, body }) => ({ success: true, id: params.id, data: body }), {
        params: t.Object({ id: t.Numeric() }),
        body: t.Object({
          movie_id: t.Number(),
          studio_id: t.Number(),
          show_date: t.String(),
          show_time: t.String(),
          price: t.Number(),
        }),
      })

      // Hapus jadwal
      .delete("/:id", ({ params }) => ({ success: true }), {
        params: t.Object({ id: t.Numeric() }),
      }),
  );
export type App = typeof wilayahRoutes;
