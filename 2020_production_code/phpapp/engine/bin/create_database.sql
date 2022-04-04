CREATE DATABASE  IF NOT EXISTS `tardproof` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `tardproof`;
-- MySQL dump 10.13  Distrib 5.6.13, for Win32 (x86)
--
-- Host: localhost    Database: tardproof
-- ------------------------------------------------------
-- Server version	5.6.16

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `access`
--

DROP TABLE IF EXISTS `access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `access` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `pleb` int(11) unsigned NOT NULL,
  `valid_from` datetime NOT NULL,
  `valid_until` datetime NOT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `capability`
--

DROP TABLE IF EXISTS `capability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `capability` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `container`
--

DROP TABLE IF EXISTS `container`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `container` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `coursefolder`
--

DROP TABLE IF EXISTS `coursefolder`;
/*!50001 DROP VIEW IF EXISTS `coursefolder`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `coursefolder` (
  `id` tinyint NOT NULL,
  `path` tinyint NOT NULL,
  `name` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `folder` varchar(255) DEFAULT NULL COMMENT 'guid',
  `touched` decimal(10,0) DEFAULT NULL,
  `engine` varchar(10) DEFAULT NULL,
  `layout` varchar(20) DEFAULT NULL,
  `stage` varchar(20) DEFAULT NULL,
  `container` int(11) DEFAULT NULL,
  `config` text COMMENT 'settings.json',
  `locked` tinyint(1) DEFAULT NULL,
  `glossary` text COMMENT 'glossary.json',
  `references` text COMMENT 'references.json',
  `help` text COMMENT 'help.txt',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `owner` int(11) DEFAULT NULL,
  `sharedwith` varchar(100) DEFAULT NULL,
  `navigation` text COMMENT 'pages.xml',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `flag`
--

DROP TABLE IF EXISTS `flag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `flag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course` text NOT NULL,
  `user` text NOT NULL,
  `colour` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `history` (
  `key` varchar(255) NOT NULL,
  `user` varchar(30) DEFAULT NULL,
  `timestamp` varchar(50) NOT NULL,
  `data` text NOT NULL,
  KEY `IDX_HISTORY_0` (`user`,`timestamp`),
  KEY `IDX_HISTORY_1` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `label`
--

DROP TABLE IF EXISTS `label`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `label` (
  `key` varchar(255) NOT NULL,
  `colour` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`key`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `page`
--

DROP TABLE IF EXISTS `page`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `page` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent` int(11) NOT NULL DEFAULT '0',
  `course` int(11) NOT NULL DEFAULT '0',
  `order` int(11) NOT NULL DEFAULT '1',
  `title` varchar(255) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `scormid` int(11) DEFAULT NULL,
  `contribute` char(1) NOT NULL DEFAULT 'n',
  `score` int(11) NOT NULL DEFAULT '0',
  `percentage` int(11) NOT NULL DEFAULT '100',
  `nav` char(1) NOT NULL DEFAULT 'n',
  `template` varchar(20) DEFAULT NULL,
  `visibility` int(11) NOT NULL DEFAULT '1',
  `content` text,
  `html` text,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` int(11) NOT NULL DEFAULT '0' COMMENT 'store userid who deleted?',
  PRIMARY KEY (`id`),
  KEY `parent` (`parent`,`course`,`deleted`)
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permission` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `plebs`
--

DROP TABLE IF EXISTS `plebs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plebs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(40) NOT NULL,
  `password` varchar(32) NOT NULL,
  `email` varchar(255) NOT NULL,
  `plan` tinyint(1) NOT NULL DEFAULT '0',
  `uniqueid` char(36) DEFAULT '',
  `prefs` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `capabilities` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shares`
--

DROP TABLE IF EXISTS `shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shares` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subtree`
--

DROP TABLE IF EXISTS `subtree`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subtree` (
  `childID` int(11) unsigned NOT NULL DEFAULT '0',
  `parentID` int(11) NOT NULL DEFAULT '0',
  `level` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`childID`,`parentID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ticket` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `who` varchar(50) NOT NULL DEFAULT '''unknown''',
  `level` varchar(5) NOT NULL DEFAULT '''meh''',
  `status` varchar(6) NOT NULL DEFAULT '''open''',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ticket_item`
--

DROP TABLE IF EXISTS `ticket_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ticket_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `who` varchar(50) NOT NULL DEFAULT '''''''unknown''''''',
  `added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `details` text,
  `url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=230 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ticket_read`
--

DROP TABLE IF EXISTS `ticket_read`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ticket_read` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `who` varchar(50) NOT NULL,
  `last_read` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tile`
--

DROP TABLE IF EXISTS `tile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tile` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `course` int(11) DEFAULT NULL,
  `pleb` int(11) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=355 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tips`
--

DROP TABLE IF EXISTS `tips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tips` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tip` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `todo`
--

DROP TABLE IF EXISTS `todo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `todo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course` text,
  `notes` text,
  `complete` decimal(10,0) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userdismissals`
--

DROP TABLE IF EXISTS `userdismissals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userdismissals` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `pleb` int(11) NOT NULL,
  `tip` int(11) NOT NULL,
  `kind` varchar(15) NOT NULL DEFAULT 'tip',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usertag`
--

DROP TABLE IF EXISTS `usertag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usertag` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `course` int(11) DEFAULT NULL,
  `pleb` int(11) DEFAULT NULL,
  `tag` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=516 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `words`
--

DROP TABLE IF EXISTS `words`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `words` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `x` int(11) DEFAULT '100',
  `y` int(11) DEFAULT '100',
  `z` int(11) DEFAULT '1',
  `word` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=217 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `coursefolder`
--

/*!50001 DROP TABLE IF EXISTS `coursefolder`*/;
/*!50001 DROP VIEW IF EXISTS `coursefolder`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`192.168.2.111` SQL SECURITY DEFINER */
/*!50001 VIEW `coursefolder` AS select `c1`.`id` AS `id`,concat('/courses/',`c2`.`name`,'/',`c1`.`folder`) AS `path`,`c1`.`name` AS `name` from (`courses` `c1` join `container` `c2` on((`c1`.`container` = `c2`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-06-29 20:37:31
