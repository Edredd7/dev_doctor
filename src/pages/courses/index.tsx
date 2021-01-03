import React, { ReactElement, useEffect, useState } from "react";
import MyAppBar from "../../components/appbar";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import YAML from "yaml";
import Course from "../../models/course";
import { Link as RouterLink, useRouteMatch } from "react-router-dom";
import LanguageOutlinedIcon from "@material-ui/icons/LanguageOutlined";

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    paddingTop: "56.25%", // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
}));

export default function CoursesPage(): ReactElement {
  const classes = useStyles();
  const { t } = useTranslation(["courses", "common"]);

  const [courses, setCourses] = useState<Array<Course>>(null);
  const getData = () => {
    fetch("/assets/courses/config.yml")
      .then((response) => response.text())
      .then(function (text) {
        var yaml = YAML.parse(text);

        var newCourses = [];
        Promise.all(
          (yaml["courses"] as Array<string>).map((slug) => {
            var course = new Course({ slug: slug });
            newCourses.push(course);
            return course.Update();
          })
        ).then(() => setCourses(newCourses));
      });
  };
  let { path } = useRouteMatch();
  useEffect(() => {
    if (!courses) getData();
  });
  const addCourse = (course: string) => {
    if (!courses) setCourses(null);
    caches
      .open(`course-${course}`)
      .then((cache) => cache.add(`assets/courses/${course}/icon.png`))
      .then(getData);
  };
  const removeCourse = (course: string) => {
    if (!courses) setCourses(null);
    caches.delete(`course-${course}`).then(getData);
  };
  return (
    <>
      <MyAppBar title={t("title")} />
      <Container className={classes.cardGrid} maxWidth="md">
        {/* End hero unit */}
        <Grid container spacing={4}>
          {courses == null ? (
            <CircularProgress />
          ) : (
            courses.map((course) => (
              <Grid item key={course["slug"]} xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                  {course["installed"] ? (
                    <Button onClick={() => removeCourse(course["slug"])}>
                      remove
                    </Button>
                  ) : (
                    <Button onClick={() => addCourse(course["slug"])}>
                      add
                    </Button>
                  )}
                  {course["icon"] && (
                    <CardMedia
                      className={classes.cardMedia}
                      image={`/assets/courses/${course["slug"]}/icon.png`}
                      title="Image title"
                    />
                  )}
                  <CardContent className={classes.cardContent}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {course["name"]}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {course["author"]}
                    </Typography>
                    <Grid container direction="row" alignItems="center">
                      <Grid item>
                        <LanguageOutlinedIcon className={classes.icon} />
                      </Grid>
                      <Grid item>
                        <Typography variant="body1" component="p">
                          {t("common:language." + course["lang"])}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Typography variant="body2" component="p">
                      {course["description"]}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={RouterLink}
                      to={`${path}/${course["slug"]}`}
                      size="small"
                      color="primary"
                    >
                      View
                    </Button>
                    <Button size="small" color="primary">
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </>
  );
}
