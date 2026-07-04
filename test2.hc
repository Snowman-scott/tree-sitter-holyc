// POSIX bindings through libc via gcc backend
extern "c" U64 time(U64 *timer);
extern "c" U8 *getenv(U8 *name);
extern "c" I32 rename(U8 *old_path, U8 *new_path);
extern "c" U64 fopen(U8 *filename, U8 *mode);
extern "c" I32 fputs(U8 *str, U64 stream);
extern "c" I32 fclose(U64 stream);
extern "c" I32 system(U8 *command);

// Global seed
U64 seed;

U64 GetRandom(U64 max)
{
  seed ^= seed << 13;
  seed ^= seed >> 7;
  seed ^= seed << 17;
  return seed % max;
}

U0 JoinPaths(U8 *dest, U8 *base, U8 *folder, U8 *filename)
{
  while (*base) { *dest = *base; dest++; base++; }
  *dest = '/'; dest++;
  while (*folder) { *dest = *folder; dest++; folder++; }
  *dest = '/'; dest++;
  while (*filename) { *dest = *filename; dest++; filename++; }
  *dest = 0;
}

// Extract just the filename out of a complex path string
U8 *GetFilename(U8 *path)
{
  U8 *filename = path;
  while (*path) {
    if (*path == '/') {
      filename = path + 1;
    }
    path++;
  }
  return filename;
}

I64 main(I64 argc, U8 **argv)
{
  if (argc < 2) {
    "Usage: ./a.out [target_file]\n";
    return 1;
  }

  U8 *src_path = argv[1]; // Captures whatever path you pass it
  U8 *filename = GetFilename(src_path);

  seed = time(0);

  U8 *home = getenv("HOME");
  if (!home) {
    "F in the logs : No home dir found\n";
    return 1;
  }

  // Auto-create bunker directory
  U8 mkdir_cmd[512];
  JoinPaths(mkdir_cmd, home, ".bunker", "");
  U8 final_cmd[560];
  U8 *cmd_start = "mkdir -p ";
  U8 *c_dest = final_cmd;
  while (*cmd_start) { *c_dest = *cmd_start; c_dest++; cmd_start++; }
  U8 *p_src = mkdir_cmd;
  while (*p_src) { *c_dest = *p_src; c_dest++; p_src++; }
  *c_dest = 0;
  system(final_cmd);

  U8 *bunker_folder = ".bunker";

  U8 *drop_zones[5];
  drop_zones[0] = "Documents";
  drop_zones[1] = "Downloads";
  drop_zones[2] = "Pictures";
  drop_zones[3] = "Music";
  drop_zones[4] = "Videos";

  U8 *lyrics[3];
  lyrics[0] = "Never gonna give you up\nNever gonna let you down\n";
  lyrics[1] = "Is this the real life?\nIs this just fantasy?\n";
  lyrics[2] = "Yesterday, all my troubles seemed so far away...\n";

  "Spinning the cylinder. . . ";
  if (GetRandom(6) != 0) {
    "Click. You survived.\n";
    return 0;
  }

  "BANG!\n";

  U8 bunker_path[512];
  U8 decoy_path[512];

  U8 *chosen_zone = drop_zones[GetRandom(5)];
  U8 *chosen_lyric = lyrics[GetRandom(3)];

  // Set up the kidnapping path and decoy target using the dynamic filename
  JoinPaths(bunker_path, home, bunker_folder, filename);
  JoinPaths(decoy_path, home, chosen_zone, filename);

  // Kidnap original file
  if (rename(src_path, bunker_path) != 0) {
    "Error: Could not process target file. Make sure it exists!\n";
    return 1;
  }

  // Drop the decoy
  U64 file_handle = fopen(decoy_path, "w");
  if (file_handle) {
    fputs(chosen_lyric, file_handle);
    fclose(file_handle);
    "The deed is done. Good luck finding it.\n"; // Completely secret!
  } else {
    "Error creating decoy file.\n";
  }

  return 0;
}
